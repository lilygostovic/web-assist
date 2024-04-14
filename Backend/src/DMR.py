"""
This file is derived using `eval` and `processing` within https://github.com/McGill-NLP/weblinx/tree/main/modeling/dmr.

For faster inferences, we remove attributes that are not needed for inference.
"""

import abc
import logging
import lxml.html
import requests
import torch
import weblinx as wl
import weblinx.utils.html as wh
import weblinx.utils.format as wf

from copy import deepcopy
from functools import partial
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim, dot_score
from typing import Any, Dict, List
from weblinx.processing.prompt import (
    format_prev_turns,
    find_turns_with_instructor_chat,
    format_utterances,
)


class BaseDMR(metaclass=abc.ABCMeta):
    """
    Base class for DRM model - supports building the query, building the records and then ranking the records.
    """

    @abc.abstractmethod
    def build_query(self, replay: wl.Replay, turn: wl.Turn):
        """
        This function formats a turn for input to the model. It does so by combining the following:
        1. The first and last `num_utterances-1` utterances from the instructor
        2. The previous turns (up to `num_prev_turns` turns)

        If return_str is True, then the output is a string. Otherwise, it returns two strings: the utterance context and the previous turns.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def build_records(self, turn: wl.Turn, uid_key: str) -> List[Dict]:
        """
        Builds the records for each visible element on the web page.

        Parameters:
        --------------
        turn: wl.Turn
            A turn containing the following keys:

            - turn.html: str (HTML string of the active page)
            - turn.bboxes: Dict[str, Dict] ({uid -> {bbox of element}})
            - turn.viewport_height: int
            - turn.viewport_width: int

        uid_key: str
            The UID we tag each element of the active page.

        Returns:
        --------------
        A list of dictionary containing only visible elements with its UID, and shortened element representation.

        """
        raise NotImplementedError

    @abc.abstractmethod
    def rank_records(self, query: str, records: List[Dict]) -> List[Dict]:
        """
        Given a list of records, use the DMR model to compare with the query to rank the records.

        Parameters:
        -----------
        query: str
            The query to compare each record to.
        records: Dict
            A dictionary containing the keys: ['uid', 'doc', 'elem_dict'].

        Returns:
        -------------
        The records object will be updated to include both the raw similarity score and the rank.
        The records object will be in the same order passed in and not sorted.
        """
        raise NotImplementedError


class DMR(BaseDMR):
    """
    Sets up DMR model we will be using. It also encapsulates all the functions needed for evaluation.
    """

    def __init__(
        self,
        name: str,
        sim_method: str,
        use_bf16: bool = True,
        batch_size_per_device: int = 64,
    ):
        """
        Initializes the DMR model.

        Parameters:
        -----------------
        name: str
            Name of the model
        sim_method: str
            Method to compare similarity to
        use_bf16: bool
            Whether to use bf16 tensor type
        batch_size_per_device: int
            Batch size to run the model
        """

        self.name = name
        self.sim_method = sim_method

        self.use_amp = not use_bf16
        self.torch_dtype = torch.bfloat16 if use_bf16 else torch.float32
        self.batch_size_per_device = batch_size_per_device

        # Setup model
        self.model = SentenceTransformer(self.name)

        # Setup similarity method
        # Use cos_sim as similarity function as default
        self.sim_func = cos_sim
        if self.sim_method == "dot_product":
            self.sim_func = dot_score
        else:
            self.sim_method = "cos_sim"

        logging.info(f"Finished Initializing DMR Model ...\n{self}")

    def __str__(self):
        str_rep = f"Model Name - {self.name}\n"
        str_rep += f"Similarity Method: {self.sim_method}\n"
        str_rep += f"Loaded model with bf16: {not self.use_amp}\n"
        str_rep += f"Batch Size: {self.batch_size_per_device}"
        return str_rep

    def build_query(self, replay: wl.Replay, turn: wl.Turn):
        return build_query(replay=replay, turn=turn)

    def build_records(self, turn: wl.Turn, uid_key: str) -> List[Dict]:
        return build_records(turn=turn, uid_key=uid_key)

    def rank_records(self, query: str, records: List[Dict]) -> List[Dict]:

        with torch.cuda.amp.autocast(enabled=self.use_amp, dtype=self.torch_dtype):
            docs = [r["doc"] for r in records]
            encoded = self.model.encode(
                [query] + docs,
                batch_size=self.batch_size_per_device,
                show_progress_bar=False,
            )
            query_vector, doc_vectors = encoded[0], encoded[1:]
            scores = self.sim_func(query_vector, doc_vectors).cpu().squeeze().tolist()
            if isinstance(scores, float):
                scores = [scores]

            for i, r in enumerate(records):
                r["score"] = scores[i]

        torch.cuda.empty_cache()

        # Add rank
        scores = {r["uid"]: r["score"] for r in records}
        ranks = get_ranks_from_scores(scores)
        for r in records:
            r["rank"] = ranks[r["uid"]]

        return records


class HF_DMR(BaseDMR):
    """
    This allows us to leverage HuggingFace Interface API to actually run the model from a different server.
    """

    def __init__(
        self,
        api_url: str,
        auth_token: str,
        sim_method: str,
    ):
        """
        Initializes the DMR model.

        Parameters:
        -----------------
        api_url: str
            URL to connect to the HuggingFace Inference API
        auth_token: str
            Authentication token to pass in the headers for the inference api.
        sim_method: str
            Method to compare similarity to
        batch_size_per_device: int
            Batch size to run the model
        """

        self.api_url = api_url
        self.headers = {"Authorization": auth_token}
        self.sim_method = sim_method

        # Setup similarity method
        # Use cos_sim as similarity function as default
        self.sim_func = cos_sim
        if self.sim_method == "dot_product":
            self.sim_func = dot_score
        else:
            self.sim_method = "cos_sim"

        logging.info(f"Finished Initializing DMR Model ...\n{self}")

    def __str__(self):
        str_rep = f"Model hosted @ URL - {self.api_url}\n"
        str_rep += f"Similarity Method: {self.sim_method}\n"
        return str_rep

    def build_query(self, replay: wl.Replay, turn: wl.Turn):
        return build_query(replay=replay, turn=turn)

    def build_records(self, turn: wl.Turn, uid_key: str) -> List[Dict]:
        return build_records(turn=turn, uid_key=uid_key)

    def _query_api(self, payload):
        response = requests.post(self.api_url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    def rank_records(self, query: str, records: List[Dict]) -> List[Dict]:

        try:

            docs = [r["doc"] for r in records]
            payload = {
                "inputs": {
                    "source_sentence": query,
                    "sentences": docs,
                }
            }

            scores = self._query_api(payload)

            if isinstance(scores, float):
                scores = [scores]

            for i, r in enumerate(records):
                r["score"] = scores[i]

            scores = {r["uid"]: r["score"] for r in records}
            ranks = get_ranks_from_scores(scores)
            for r in records:
                r["rank"] = ranks[r["uid"]]

        except requests.exceptions.RequestException as e:

            error_msg = f"Trouble requesting from URL: {self.api_url}\n"
            error_msg += "Providing rank based on the order in the HTML page.\n"
            error_msg += f"Error:\n{e}"
            logging.error(error_msg)

            # Candidates are just ranked & scored in the order they came in
            for rank, r in enumerate(records, start=1):
                r["rank"] = rank
                r["score"] = -1

        return records


############ Helper Functions ##############################


############ Query ###########################################


def build_formatters():
    """
    This returns callable functions to format each input from the different Intent types.
    """
    format_element_input = partial(
        wf.format_element,
        include_text=False,
        include_attrs=("class", "title", "href", "aria-label", "d", "src"),
    )
    format_click_input = partial(
        wf.format_click,
        formatters=(wf.format_mouse_xy, format_element_input, wf.format_timestamp),
    )
    format_change_input = partial(
        wf.format_change,
        formatters=(
            partial(wf.format_arg_item, name="value"),
            format_element_input,
            wf.format_timestamp,
        ),
    )
    format_hover_input = partial(
        wf.format_hover,
        formatters=(wf.format_mouse_xy, format_element_input, wf.format_timestamp),
    )

    format_submit_input = partial(
        wf.format_submit, formatters=(format_element_input, wf.format_timestamp)
    )

    format_text_input_input = partial(
        wf.format_text_input,
        formatters=(
            partial(wf.format_arg_item, name="text"),
            partial(format_element_input),
            wf.format_timestamp,
        ),
    )

    format_intent_input = partial(
        wf.format_intent_automatically,
        format_click=format_click_input,
        format_change=format_change_input,
        format_hover=format_hover_input,
        format_submit=format_submit_input,
        format_text_input=format_text_input_input,
        return_as=str,
    )

    # second, for the output (prediction text)
    format_element_out = partial(
        wf.format_element,
        # Only want the tag
        include_text=False,
        include_attrs=False,
    )

    format_click_out = partial(wf.format_click, formatters=(wf.format_mouse_xy,))
    format_text_input_out = partial(
        wf.format_text_input,
        formatters=(
            partial(wf.format_arg_item, name="text", max_length=200),
            format_element_out,
            wf.format_target_bbox,
        ),
    )
    format_change_out = partial(
        wf.format_change,
        formatters=(
            partial(wf.format_arg_item, name="value", max_length=200),
            format_element_out,
            wf.format_target_bbox,
        ),
    )
    format_submit_out = partial(
        wf.format_submit, formatters=(format_element_out, wf.format_target_bbox)
    )
    format_load_out = partial(
        wf.format_load,
        include_transition=False,
        include_timestamp=False,
        max_length=200,
    )
    format_scroll_out = partial(wf.format_scroll, include_timestamp=False)

    format_say_out = partial(wf.format_say, include_timestamp=False)

    format_intent_out = partial(
        wf.format_intent_automatically,
        format_change=format_change_out,
        format_click=format_click_out,
        format_load=format_load_out,
        format_say=format_say_out,
        format_scroll=format_scroll_out,
        format_submit=format_submit_out,
        format_text_input=format_text_input_out,
    )

    return format_intent_input, format_intent_out


format_intent_input, _ = build_formatters()


def build_query(
    replay,
    turn,
    turn_sep=" ; ",
    num_prev_turns=5,
    num_utterances=5,
    return_str=True,
):
    """
    This function formats a turn for input to the model. It does so by combining the following:
    1. The first and last `num_utterances-1` utterances from the instructor
    2. The previous turns (up to `num_prev_turns` turns)

    If return_str is True, then the output is a string. Otherwise, it returns two strings: the utterance context and the previous turns.
    """
    prev_turns_text = format_prev_turns(
        replay=replay,
        turn=turn,
        format_intent=format_intent_input,
        turn_sep=turn_sep,
        num_prev_turns=num_prev_turns,
    )
    instructor_chat_turns = find_turns_with_instructor_chat(
        replay, turn, num_prev_turns=num_prev_turns
    )
    utterance_context = format_utterances(
        instructor_chat_turns, num_utterances=num_utterances
    )

    if not return_str:
        return utterance_context, prev_turns_text

    # Now, let's combine the text from the previous turns with the utterance context
    # and the current turn's utterance
    text = (
        f"Viewport(height={turn.viewport_height}, width={turn.viewport_width}) ---- "
        f"Instructor Utterances: {utterance_context} ---- "
        f"Previous Turns:{prev_turns_text}"
    )

    return text


############## Records ##########################################


def format_attrs(attrs):
    return " ".join([f"{k!s}={v!r}" for k, v in attrs.items()])


def shorten(s, max_length=100, side="center", ellipsis="..."):
    if max_length is None:
        return s

    if len(s) <= max_length:
        return s

    max_length = max_length - len(ellipsis)

    if side == "right":
        s = s[:max_length] + ellipsis
    elif side == "left":
        s = ellipsis + s[-max_length:]
    elif side == "center":
        s = s[: max_length // 2] + ellipsis + s[-max_length // 2 :]
    else:
        raise ValueError(f"Invalid side: {side}")

    return s


def format_children(parent, depth=1):
    """
    Use the concise parentheses notation to format the children of an element.
    For example, for depth 1, we only have: (child1 child2 child3)
    For depth 2, we have: (child1 (grandchild1 grandchild2) child2 child3)
    """
    children = parent.getchildren()
    if len(children) == 0:
        return ""

    if depth == 1:
        return " ".join([c.tag for c in children])

    out_str = ""
    for c in children:
        out_str += f"{c.tag}"
        children_str = format_children(c, depth=depth - 1)
        if children_str != "":
            out_str += f" ( {children_str} )"
        out_str += " "

    return out_str.strip()


def represent_element_as_dict(
    element,
    bbox,
    root_tree,
    max_text_length=200,
    max_attr_length=100,
    max_child_depth=2,
):
    """
    Format an lxml element into a dictionary of strings. The keys are:
    - tag: the tag name of the element
    - xpath: the xpath of the element
    - text: the text of the element, truncated to `max_text_length`
    - bbox: the bounding box of the element
    - attributes: the attributes of the element, truncated to `max_attr_length`
    - children: the children of the element, truncated to `max_attr_length`
    """
    # Get the tag name
    tag = element.tag
    xpath = root_tree.getpath(element)
    children = element.getchildren()
    text = element.text if element.text is not None else ""

    # Shorten the text and attributes
    text = shorten(text, max_text_length)
    attrs = {k: shorten(v, max_attr_length) for k, v in element.attrib.items()}

    # Sort the attributes by length
    attrs = dict(sorted(attrs.items(), key=lambda x: len(x[1])))

    # Truncate the children
    children = children[:max_child_depth]

    # Format the children
    children_str = " ".join([c.tag for c in children if isinstance(c.tag, str)])
    children_str = shorten(children_str, max_attr_length)

    # Format the attributes
    attrs_str = format_attrs(attrs)

    # Format the bounding box
    bbox_str = " ".join(
        [f"{k}={round(bbox[k], 1)}" for k in ["x", "y", "width", "height"]]
    )

    # format as a dict
    element_dict = {
        "tag": tag,
        "xpath": xpath,
        "text": text,
        "bbox": bbox_str,
        "attributes": attrs_str,
        "children": children_str,
    }

    return element_dict


def convert_elem_dict_to_str_legacy(elem_dict: dict):
    """
    Convert an element dictionary to a string.
    """
    elem_dict = deepcopy(elem_dict)

    element_str = f"[[tag]] {elem_dict.pop('tag')}\n"
    element_str += f"[[xpath]] {elem_dict.pop('xpath')}\n"
    element_str += f"[[text]] {elem_dict.pop('text')}\n"
    element_str += f"[[bbox]] {elem_dict.pop('bbox')}\n"
    element_str += f"[[attributes]] {elem_dict.pop('attributes')}\n"
    element_str += f"[[children]] {elem_dict.pop('children')}"

    # for other keys, we just add them to the end

    for k, v in elem_dict.items():
        element_str += f"\n[[{k}]] {v}"

    return element_str


def build_records(
    turn: wl.Turn,
    uid_key: str,
) -> List[Dict]:
    """
    Builds the records for each visible element on the web page.

    Parameters:
    --------------
    turn: wl.Turn
        A turn containing the following keys:

        - turn.html: str (HTML string of the active page)
        - turn.bboxes: Dict[str, Dict] ({uid -> {bbox of element}})
        - turn.viewport_height: int
        - turn.viewport_width: int
    uid_key: str
        The UID we tag each element of the active page.

    Returns:
    --------------
    A list of dictionary containing only visible elements with its UID, and shortened element representation.
    """

    # Load HTML and get all elements we tagged
    root = lxml.html.fromstring(turn.html)
    root_tree = root.getroottree()
    elements = root.xpath(f"//*[@{uid_key}]")

    # Filter to elements within our viewport
    bboxes_filt = wh.filter_bboxes(
        turn.bboxes,
        viewport_height=turn.viewport_height,
        viewport_width=turn.viewport_width,
    )
    elements_filt = [p for p in elements if p.attrib[uid_key] in bboxes_filt]

    output_records = []

    # Create a record per element?
    for elem in elements_filt:
        bbox = turn.bboxes[elem.attrib[uid_key]]
        elem_dict = represent_element_as_dict(elem, bbox, root_tree)
        elem_str = convert_elem_dict_to_str_legacy(elem_dict)

        record = {
            "uid": elem.attrib[uid_key],
            "doc": elem_str,
            "elem_dict": elem_dict,
        }

        output_records.append(record)

    return output_records


def get_ranks_from_scores(scores: Dict[Any, float], starts_at=1) -> Dict[Any, int]:
    """
    Given a dictionary of key -> scores, return a dictionary of key -> ranks.
    """
    # Get sorted keys
    keys = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)
    ranks = {k: i + starts_at for i, k in enumerate(keys)}

    return ranks


###############################################################################
