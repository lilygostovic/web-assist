"""
This file is derived using `eval` and `processing` within https://github.com/McGill-NLP/weblinx/tree/main/modeling/llama.

For faster inferences, we remove attributes that are not needed for inference.
"""

import abc
import logging
import lxml.html
import torch
import traceback
import weblinx as wl
import weblinx.utils.format as wf
import weblinx.processing.intent as wi


from functools import partial
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    pipeline,
)
from typing import Callable, Dict, List

from weblinx.processing.dom import clean_and_prune_tree
from weblinx.processing.outputs import (
    parse_predicted_output_string,
    sanitize_args,
    # infer_element_for_action,
    get_element_uid_by_coords,
    get_xy_coords_corners,
    dict_has_keys,
    # get_element_info,
)
from weblinx.processing.prompt import (
    find_turns_with_instructor_chat,
    format_candidates,
    format_utterances,
    format_utterances_truncated,
    get_speaker,
    multi_attempt_format_prev_turns_truncated,
)
from weblinx.processing.truncation import (
    multi_attempt_truncate_cands_turn,
    multi_attempt_truncate_dom_tree,
)


class BaseActionAgent(metaclass=abc.ABCMeta):
    """
    Base class for the Action Agent - supports building the prompt and generating the next action.
    """

    @abc.abstractmethod
    def build_prompt(
        self,
        replay: wl.Replay,
        turn: wl.Turn,
        cands_turn: List[Dict] = None,
    ) -> List[Dict]:
        """
        Given the current state, we build the new prompt for the model.

        Parameters:
        -------------
        replay: wl.Replay
            The last turns in this dialogue
        turn: wl.Turn
            The current turn in the dialogue
        cands_turn: List[Dict]
            The candidate elements for this turn.

        Returns:
        ---------
        Model Prompt (List)
        """
        raise NotImplementedError

    @abc.abstractmethod
    def next_action(
        self,
        turn: wl.Turn,
        uid_key: str,
        model_prompt: List[Dict],
    ):
        """
        Runs the action model to predict the next action.

        Parameter:
        -------------
        turn: wl.Turn
            The prev_turn
        uid_key: str
            The key to the unique attribute
        model_prompt: List[Dict]
            The prompt of the model

        Returns:
        --------
        pred_action: Dict[str, Any]
            The predicted action in the format of `intent`, `args` and `element`.
        """


class ActionAgent(BaseActionAgent):
    """
    Agent to choose the next action based on the user input.
    """

    def __init__(
        self,
        tokenizer: str,
        model: str,
        use_rope: bool = True,
        use_flash_attention_2: bool = True,
        max_out_len=256,
        batch_size_per_device=2,
    ):
        """
        Initializes the agent.
        """
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer, padding_side="left")
        self.tokenizer.pad_token = self.tokenizer.eos_token

        self.name = model
        self.use_rope = use_rope
        self.use_flash_attention_2 = use_flash_attention_2

        self.max_out_len = 256
        self.batch_size_per_device = 2

        # Setup model
        model_kwargs = dict(device_map="auto", torch_dtype=torch.bfloat16)
        if use_rope:
            model_kwargs["rope_scaling"] = {"type": "dynamic", "factor": 2.0}
        if use_flash_attention_2:
            model_kwargs["use_flash_attention_2"] = True
        self.model = AutoModelForCausalLM.from_pretrained(self.name, **model_kwargs)

        # Setup our pipeline we use to run
        self.pipeline = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            torch_dtype=torch.bfloat16,
        )
        self.pipe_kwargs = dict(
            max_new_tokens=max_out_len,
            return_full_text=False,
            batch_size=batch_size_per_device,
            pad_token_id=self.tokenizer.eos_token_id,
        )

        format_intent = build_formatter_for_multichoice()
        self.build_prompt_fn = partial(
            build_prompt_records_for_llama_truncated,
            format_intent=format_intent,
            tokenizer=self.tokenizer,
        )

        logging.info(f"Finished Initializing Action Agent ...\n{self}")

    def __str__(self):
        str_rep = f"Model Name - {self.name}\n"
        str_rep += f"Use Rope: {self.use_rope}\n"
        str_rep += f"Use Flash Attention 2: {self.use_flash_attention_2}\n"
        str_rep += f"Batch Size: {self.batch_size_per_device}\n"
        str_rep += f"Max Output Length: {self.max_out_len}"
        return str_rep

    def build_prompt(
        self,
        replay: wl.Replay,
        turn: wl.Turn,
        cands_turn: List[Dict] = None,
    ) -> List[Dict]:

        # Change final_user_message if it was actually from the user.
        final_user_message = None
        if (turn.type == "chat") and (turn["speaker"] == "instructor"):
            final_user_message = turn["utterance"]

        # Sort candidates
        cands_turn = sorted(cands_turn, key=lambda c: c["rank"])

        model_prompt = self.build_prompt_fn(
            replay=replay,
            turn=turn,
            cands_turn=cands_turn[:20],  # Select top 20 candidates
            final_user_message=final_user_message,
        )

        insert_empty_user_content_at_first(model_prompt)
        return model_prompt

    def next_action(
        self,
        turn: wl.Turn,
        uid_key: str,
        model_prompt: List[Dict],
    ):
        """
        Runs the action model to predict the next action.

        Parameter:
        -------------
        model_prompt: List[Dict]
            The prompt of the model

        Returns:
        --------
        pred_action: Dict[str, Any]
            The predicted action in the format of `intent`, `args` and `element`.
        """

        model_input = self.tokenizer.apply_chat_template(
            model_prompt, tokenize=False, add_generation_prompt=False
        )

        ################
        with torch.cuda.amp.autocast(dtype=torch.bfloat16):
            out = self.pipeline(model_input, **self.pipe_kwargs)
            pred = out[0]["generated_text"]

            # Could have unknown intent
            intent, args = parse_predicted_output_string(pred)
            args = sanitize_args(args)

            infered_element = infer_element_for_action(
                intent=intent, args=args, turn=turn, uid_key=uid_key
            )
            pred_action = {"intent": intent, "args": args, "element": infered_element}

        return pred_action


####################### Prompt Builder ###########################


def build_formatter_for_multichoice():
    format_click = partial(wf.format_click, formatters=(wf.format_uid,))
    format_text_input = partial(
        wf.format_text_input,
        formatters=(
            partial(wf.format_arg_item, name="text", max_length=200),
            wf.format_uid,
        ),
    )
    format_change = partial(
        wf.format_change,
        formatters=(
            partial(wf.format_arg_item, name="value", max_length=200),
            wf.format_uid,
        ),
    )
    format_submit = partial(wf.format_submit, formatters=(wf.format_uid,))
    format_load = partial(
        wf.format_load,
        include_transition=False,
        include_timestamp=False,
        max_length=200,
    )
    format_scroll = partial(wf.format_scroll, include_timestamp=False)

    format_say = partial(wf.format_say, include_timestamp=False)

    format_intent_auto = partial(
        wf.format_intent_automatically,
        format_change=format_change,
        format_click=format_click,
        format_load=format_load,
        format_say=format_say,
        format_scroll=format_scroll,
        format_submit=format_submit,
        format_text_input=format_text_input,
    )

    return format_intent_auto


def get_system_prompt_template_for_llama_mc_concise():
    sys_prompt_template = (
        "You are an AI assistant with a deep understanding of HTML "
        "and you must predict actions based on a user request, which will be executed. "
        "Use one of the following, replacing [] with an appropriate value: "
        "change(value=[str], uid=[str]) ; "
        "click(uid=[str]) ; "
        "load(url=[str]) ; "
        'say(speaker="navigator", utterance=[str]) ; '
        "scroll(x=[int], y=[int]) ; "
        "submit(uid=[str]) ;"
        "text_input(text=[str], uid=[str]) ;\n"
        "The user's first and last {num_utterances} utterances are: "
        "{utterance_context} ;\n"
        "Viewport size: {height}h x {width}w ;\n"
        "Only the last {num_prev_turns} turns are provided."
    )

    return sys_prompt_template


def get_candidate_prompt_template_for_llama():
    return "Here are the top candidates for this turn: {candidate_str}\n"


def get_final_user_message():
    return "Please select the best action using the correct format, do not provide any other information or explanation."


def merge_prev_turns(prev_turns_text_list, final_user_message):
    prev_turns_merged = []

    # Merge turns from the same role
    for i, turn_text in enumerate(prev_turns_text_list):
        role = get_speaker(
            turn_text,
            instructor_name="user",
            navigator_name="assistant",
            default_name="unknown",
        )

        if i > 0 and prev_turns_merged[-1]["role"] == role:
            prev_turns_merged[-1]["content"] += " " + turn_text
        else:
            prev_turns_merged.append({"role": role, "content": turn_text})

    if len(prev_turns_merged) > 0 and prev_turns_merged[-1]["role"] == "user":
        prev_turns_merged[-1]["content"] += " " + final_user_message
    else:
        prev_turns_merged.append({"role": "user", "content": final_user_message})

    return prev_turns_merged


def build_prompt_records_for_llama_truncated(
    replay: wl.Replay,
    turn: wl.Turn,
    format_intent,
    tokenizer,
    cands_turn=None,
    num_utterances=5,
    num_prev_turns=5,
    system_prompt_template=None,
    candidate_prompt_template=None,
    final_user_message=None,
    include_html=True,
    format_candidates_fn=partial(
        format_candidates, max_char_len=None, use_uid_as_rank=True
    ),
    merge_prev_turns_fn=merge_prev_turns,
    format_output_dict_fn: Callable = partial(
        wf.format_output_dictionary, function_key="intent"
    ),
    max_html_tokens=700,
    max_utterance_tokens=40 * 5,
    max_prev_turns_tokens=50 * 5,
    max_candidates_tokens=65 * 10,
    add_unused_len_to_cands=True,
    allow_iterative_reduction=False,
    parser=None,
):
    """
    Parameters
    ----------
    ...
    allow_iterative_reduction : bool
        This arg is only relevant when truncate_at_center is used behind the scene (e.g. for
        multi_attempt_format_prev_turns_truncated or multi_attempt_truncate_dom_tree). If True,
        then we will allow the iterative reduction to continue until the max_tokens is reached.
        This is useful when the tokenizer output does not necessarily decrease when we remove
        tokens from the input. For example, if we remove a token that is part of a word, but
        the updated text is retokenized to the same number of tokens, then we will continue
        to remove tokens until we reach the max_tokens limit.
    """
    if system_prompt_template is None:
        system_prompt_template = get_system_prompt_template_for_llama_mc_concise()

    if candidate_prompt_template is None:
        candidate_prompt_template = get_candidate_prompt_template_for_llama()

    if final_user_message is None:
        final_user_message = get_final_user_message()

    instructor_chat_turns = find_turns_with_instructor_chat(replay, turn)

    utterance_context = format_utterances_truncated(
        instructor_chat_turns,
        tokenizer=tokenizer,
        max_tokens=max_utterance_tokens,
        num_utterances=num_utterances,
        format_utterances_fn=format_utterances,
        allow_iterative_reduction=allow_iterative_reduction,
    )

    prev_turns_text_list = multi_attempt_format_prev_turns_truncated(
        replay=replay,
        turn=turn,
        format_intent=partial(format_intent, return_as=dict),
        tokenizer=tokenizer,
        num_prev_turns=num_prev_turns,
        turn_sep=None,  # output list
        max_tokens=max_prev_turns_tokens,
        max_attempts=5,
        format_output_dict_fn=format_output_dict_fn,
        warn_after_attempts=False,
        allow_iterative_reduction=allow_iterative_reduction,
    )

    prev_turns_merged = merge_prev_turns_fn(
        prev_turns_text_list=prev_turns_text_list, final_user_message=final_user_message
    )

    sys_prompt = system_prompt_template.format(
        num_utterances=num_utterances - 1,  # 1 less since we add the first utterance
        utterance_context=utterance_context,
        height=turn.viewport_height,
        width=turn.viewport_width,
        num_prev_turns=num_prev_turns,
    )

    html = ""
    if include_html and turn.html not in ["", None] and cands_turn is not None:
        dom_tree_raw = lxml.html.fromstring(turn.html, parser=parser)
        dom_tree_pruned = clean_and_prune_tree(dom_tree_raw, cands_turn=cands_turn)
        trunc = multi_attempt_truncate_dom_tree(
            dom_tree=dom_tree_pruned,
            tokenizer=tokenizer,
            max_tokens=max_html_tokens,
            warn_after_attempts=False,
            allow_iterative_reduction=allow_iterative_reduction,
        )
        html = trunc["tree_repr"]
        sys_prompt = html + sys_prompt

    if cands_turn is not None:
        if add_unused_len_to_cands:
            # Add the unused length to the candidates
            num_html_tokens = len(tokenizer.tokenize(html))
            num_utter_tokens = len(tokenizer.tokenize(utterance_context))
            num_prev_turns_tokens = len(
                tokenizer.tokenize(" ".join(prev_turns_text_list))
            )
            remain_html_tokens = max_html_tokens - num_html_tokens
            remain_utter_tokens = max_utterance_tokens - num_utter_tokens
            remain_prev_turns_tokens = max_prev_turns_tokens - num_prev_turns_tokens
            remain_tokens = (
                remain_html_tokens + remain_utter_tokens + remain_prev_turns_tokens
            )
            # Add the unused length to the max_candidates_tokens
            max_candidates_tokens += remain_tokens

        cands_turn_trunc = multi_attempt_truncate_cands_turn(
            cands_turn=cands_turn,
            tokenizer=tokenizer,
            max_tokens=max_candidates_tokens,
            format_candidates_fn=format_candidates_fn,
            warn_after_attempts=False,
            allow_iterative_reduction=allow_iterative_reduction,
        )
        cand_str = format_candidates_fn(cands_turn_trunc, max_char_len=None)
        cand_prompt = candidate_prompt_template.format(candidate_str=cand_str)
        sys_prompt += "\n" + cand_prompt

    return [{"role": "system", "content": sys_prompt}, *prev_turns_merged]


def insert_empty_user_content_at_first(prompt: list):
    """
    Given a list of dictionary representing the input prompt, insert an empty user content at the first position
    after system content, only if it is not already a user content. This is done in place.
    """
    if prompt[0]["role"] != "system":
        raise ValueError(
            f"First prompt must be a system prompt. Got {prompt[0]['role']} instead."
        )

    if prompt[1]["role"] != "user":
        prompt.insert(1, {"role": "user", "content": ""})


##########################################################################


def infer_element_for_action(intent, args, turn: wl.Turn, uid_key: str):
    """
    Given an intent and args, infer the element that the action is performed on, if
    the element is not explicitly specified.
    """
    element = None

    if intent in wi.Intent.get_element_intents(as_set=True):

        # find the referenced element
        if "uid" in args:
            uid = args["uid"]

        elif uid_key in args:
            uid = args[uid_key]

        elif "x" in args and "y" in args:
            if args["x"] is None or args["y"] is None:
                uid = None
            else:
                uid = get_element_uid_by_coords(turn, args["x"], args["y"])

        elif dict_has_keys(args, ["top", "left", "right", "bottom"]):
            coords = get_xy_coords_corners(args)
            if coords is not None:
                x, y = coords
                uid = get_element_uid_by_coords(turn, x, y)
            else:
                uid = None
        else:
            uid = None

        if uid is not None:
            element = get_element_info(turn, uid, uid_key)

    return element


def get_element_info(
    turn: wl.Turn,
    uid: str,
    uid_key: str,
):
    """
    Given a uid_key for an element, retrieve additional information about the element from the HTML which can be used for evaluation.

    Extracts only the information needed loafor evaluation.
    """
    if not uid:
        return None

    elem_xpath = turn.get_element_xpath(uid, uid_key)
    logging.debug(elem_xpath)

    elem_bbox = turn.get_element_bbox(uid)
    logging.debug(elem_bbox)

    element_info = {
        "attributes": {
            uid_key: uid,
        },
        "bbox": elem_bbox,
        "xpath": elem_xpath,
    }

    return element_info
