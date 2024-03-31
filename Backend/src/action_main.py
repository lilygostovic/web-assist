import hydra
import json
import logging
import weblinx as wl

from datetime import datetime
from omegaconf import OmegaConf

from . import ActionAgent
from .WebLinxHelper import InferReplay
from .schema import (
    PrevTurn,
    UserIntent,
    UserIntentEnum,
    BrowserIntentEnum,
    Element,
    BoundingBox,
)


@hydra.main(version_base=None, config_path="conf", config_name="config")
def main(cfg):

    # Setup logger
    logger = logging.getLogger(__name__)
    # Logs our info
    logger.info(OmegaConf.to_yaml(cfg))

    ################ Setup Action Model ########################################

    action_agent = ActionAgent.ActionAgent(
        tokenizer=cfg.action.tokenizer,
        model=cfg.action.model,
        use_rope=cfg.action.use_rope,
        use_flash_attention_2=cfg.action.use_flash_attention_2,
        max_out_len=cfg.action.max_out_len,
        batch_size_per_device=cfg.action.batch_size_per_device,
    )

    replay = InferReplay(session_id="Testing123")

    ####  Mock browser logic ######
    end_console_loop = False

    ### Mock object we get from the DMR ###
    cands_turn = []
    i = 0
    with open("../wl_data/candidates/test_ckmtdoi.jsonl") as f:
        for line in f:
            out = json.loads(line)
            if out["turn_index"] == 5:
                cands_turn.append(out)
                i += 1
                if i == 10:
                    break

    # Mock objects we need from the browser each turn
    bboxes = wl.utils.auto_read_json("./demonstrations/ckmtdoi/bboxes/bboxes-2.json")
    page = wl.utils.html.open_html_with_encodings(
        "./demonstrations/ckmtdoi/pages/page-2-0.html", raise_error=True
    )
    metadata = {
        "mouseX": 0,
        "mouseY": 0,
        "tabId": 2011645173,
        "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
        "viewportHeight": 651,
        "viewportWidth": 1366,
        "zoomLevel": 1,
    }

    element = Element(
        attributes={
            "class": "LC20lb MBeuO DKV0Md",
            "data-webtasks-id": "61376daa-59d3-4a16",
        },
        bbox=BoundingBox(
            bottom=263.53125,
            height=31,
            left=180,
            right=503.171875,
            top=232.53,
            width=323.17,
            x=180,
            y=232.53,
        ),
        tagName="H3",
        xpath='id("rso")/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/a[1]/h3[1]',
        textContent="2023 Canada Income Tax Calculator",
    )

    uid_key = "data-webtasks-id"

    prev_turn = None

    # Mocking the front-end and back-end communicating
    while not end_console_loop:

        # Browser Extension (user input)
        chat_input = input("User Input...:")

        # Browser front-end escape
        if chat_input == "exit":
            break

        if prev_turn is not None:
            replay.build_add_InferTurn(prev_turn=prev_turn)

        # Check if user is continue / chat
        if chat_input == UserIntentEnum.continue_:
            user_intent = UserIntent(intent=UserIntentEnum.continue_)
        else:
            user_intent = UserIntent(intent="say", utterance=chat_input)

        # Case 1: User "say"
        curr_turn = None

        if user_intent.intent == UserIntentEnum.say:
            curr_turn = replay.buildInferTurn(turn=user_intent)

        # Case 2: User "continues"
        else:
            # Case 2.1 No prev_turn -> ask the user for input again
            if not prev_turn:
                logger.warning("User continued and no previous turns.")
                continue

            # Case 2.2 Has prev_turn
            curr_turn = replay.remove_lastInferTurn()

        # Build prompt & predict action
        action_prompt = action_agent.build_prompt(
            replay=replay,
            turn=curr_turn,
            cands_turn=cands_turn,
        )

        next_action = action_agent.next_action(
            turn=curr_turn, uid_key=uid_key, model_prompt=action_prompt
        )

        replay.addInferTurn(curr_turn)

        # Display our action
        # Mock what the browser does (perform action & return prev_turn)
        if next_action["intent"] == BrowserIntentEnum.say:
            prev_turn = PrevTurn(
                intent=next_action["intent"], utterance=next_action["args"]["utterance"]
            )
            logger.info(f"Navigator: {prev_turn.utterance}")
        else:
            prev_turn = PrevTurn(
                intent=next_action["intent"],
                html=page,
                bboxes=bboxes,
                metadata=metadata,
                element=element if next_action["element"] else None,
                scrollX=next_action["args"].get("X"),
                scrollY=next_action["args"].get("Y"),
                properties={},
            )

            if prev_turn.intent == BrowserIntentEnum.load:
                logger.info(
                    f"Navigator {prev_turn.intent} {next_action['args']['url']}"
                )
            elif prev_turn.intent == BrowserIntentEnum.scroll:
                logger.info(
                    f"Navigator {prev_turn.intent} to ({prev_turn.scrollX}, {prev_turn.scrollY})"
                )
            else:
                logger.info(
                    f"Navigator {prev_turn.intent} element {next_action['element']}"
                )

                if not next_action["element"]:
                    prev_turn = replay.remove_lastInferTurn()
                    logger.warning("Bad predicted action... rolling back prev_turn")


if __name__ == "__main__":
    main()
