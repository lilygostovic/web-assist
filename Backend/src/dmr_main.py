import hydra
import json
import logging
import weblinx as wl

from omegaconf import OmegaConf

import DMR
from WebLinxHelper import InferReplay, InferTurn
from schema import PrevTurn, UserIntent


@hydra.main(version_base=None, config_path="conf", config_name="config")
def main(cfg):

    # Setup logger
    logger = logging.getLogger(__name__)
    # Logs our info
    logger.info(OmegaConf.to_yaml(cfg))

    ################ Setup DMR Model ########################################

    dmr_model = DMR.DMR(
        name=cfg.dmr.model,
        sim_method=cfg.dmr.get("similarity", "cos_sim"),
        use_bf16=cfg.dmr.use_bf16,
        batch_size_per_device=cfg.dmr.batch_size_per_device,
    )

    # dmr_model = DMR.HF_DMR(
    #     api_url="https://api-inference.huggingface.co/models/McGill-NLP/MiniLM-L6-dmr",
    #     auth_token="",
    #     sim_method=cfg.dmr.get("similarity", "cos_sim"),
    # )

    ##########################################################################

    ###### Mocking the replay #################################################
    replay = InferReplay(session_id="Testing123")

    start_turn = UserIntent(intent="say", utterance="Hello!")
    turn_2 = PrevTurn(intent="say", utterance="Hi")
    turn_3 = UserIntent(
        intent="say",
        utterance="I'm located in Manitoba, and I'd like to know my tax details using the Wealthsimple tax calculator.",
    )
    turn_4 = PrevTurn(intent="say", utterance="Alright")

    replay.appendTurn(InferTurn(prev_turn=start_turn, index=0, timestamp=0))
    replay.appendTurn(InferTurn(prev_turn=turn_2, index=1, timestamp=1))
    replay.appendTurn(InferTurn(prev_turn=turn_3, index=2, timestamp=2))
    replay.appendTurn(InferTurn(prev_turn=turn_4, index=3, timestamp=3))

    ########### Mocking the turns ################################################
    turn_5 = PrevTurn(
        intent="click",
        html=wl.utils.html.open_html_with_encodings("./ckmtdoi/pages/page-2-0.html"),
        bboxes=wl.utils.auto_read_json("./ckmtdoi/bboxes/bboxes-2.json"),
        metadata={
            "mouseX": 0,
            "mouseY": 0,
            "tabId": 2011645173,
            "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
            "viewportHeight": 651,
            "viewportWidth": 1366,
            "zoomLevel": 1,
        },
    )

    uid_key = "data-webtasks-id"
    prev_turn = InferTurn(prev_turn=turn_5, index=4, timestamp=6)

    ###### Build query first ####################################################
    query = dmr_model.build_query(replay=replay, turn=prev_turn)
    records = dmr_model.build_records(
        turn=prev_turn,
        uid_key=uid_key,
    )

    logging.info(f"Record Length: {len(records)}")

    records = dmr_model.rank_records(query=query, records=records)

    # Save records and scores
    with open("scores.jsonl", "w") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")


if __name__ == "__main__":
    main()
