import hydra
import json
import logging
import traceback
import uvicorn
import weblinx as wl


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from omegaconf import OmegaConf
from threading import Lock
from typing import List, Optional, Union

from ActionAgent import ActionAgent
from DMR import DMR
from schema import (
    ResponseBody,
    RequestBody,
    UserIntentEnum,
    BrowserIntentEnum,
)
from WebLinxHelper import InferReplay

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


### Setup #############
hydra.initialize(config_path="./", version_base=None)
cfg = hydra.compose(config_name="config")

# Logger setup
logger = logging.getLogger(__name__)
logger.info(OmegaConf.to_yaml(cfg))

## Setup DMR model
dmr_model = DMR(
    name=cfg.dmr.model,
    sim_method=cfg.dmr.get("similarity", "cos_sim"),
    use_bf16=cfg.dmr.use_bf16,
    batch_size_per_device=cfg.dmr.batch_size_per_device,
)

## Setup Action Agent
action_agent = ActionAgent(
    tokenizer=cfg.action.tokenizer,
    model=cfg.action.model,
    use_rope=cfg.action.use_rope,
    use_flash_attention_2=cfg.action.use_flash_attention_2,
    max_out_len=cfg.action.max_out_len,
    batch_size_per_device=cfg.action.batch_size_per_device,
)


# Dictionary to store session locks and replays
session_locks = {}
stored_replays = {}

BrowserIntentsWithElements = [
    BrowserIntentEnum.change,
    BrowserIntentEnum.click,
    BrowserIntentEnum.submit,
    BrowserIntentEnum.textInput,
]


@app.post("/v1/hello")
async def hello_world():
    return {"message": "Hello, World!"}


@app.post("/v1/get_next_action", response_model=ResponseBody)
async def get_next_action(request_body: RequestBody):
    # Validate the request body using Pydantic model
    try:

        session_key = request_body.sessionID

        # Check if session key exists, if not, create a new lock for it
        if session_key not in session_locks:
            session_locks[session_key] = Lock()

        with session_locks[session_key]:

            # Create new replay object if not there
            if session_key not in stored_replays:
                stored_replays[session_key] = InferReplay(session_id=session_key)
            replay = stored_replays[session_key]
            logger.info(f"Current replay {replay.session_id} has {len(replay)} turns.")

            # Add prev turn if exist
            if request_body.prev_turn:
                replay.build_add_InferTurn(
                    prev_turn=request_body.prev_turn,
                    html=request_body.html,
                    bboxes=request_body.bboxes,
                    metadata=request_body.metadata,
                )

            # Check the user intent
            user_intent = request_body.user_intent
            if (user_intent.intent == UserIntentEnum.continue_) and (
                not request_body.prev_turn
            ):
                raise HTTPException(
                    status_code=400, detail="User continued and no previous turns."
                )

            # Curr_turn would be from the user or we use the pop the prev_turn in the replay & use
            if user_intent.intent == UserIntentEnum.say:
                curr_turn = replay.buildInferTurn(
                    turn=user_intent,
                    html=request_body.html,
                    bboxes=request_body.bboxes,
                    metadata=request_body.metadata,
                )
            else:
                curr_turn = replay.remove_lastInferTurn()

            # We query DRM model if there is turn.HTML and turn.bboxes exist
            uid_key = request_body.uid_key

            cands_turn = None
            if curr_turn.has_html() and curr_turn.has_bboxes():
                dmr_query = dmr_model.build_query(replay=replay, turn=curr_turn)
                dmr_records = dmr_model.build_records(
                    turn=curr_turn,
                    uid_key=uid_key,
                )
                cands_turn = dmr_model.rank_records(
                    query=dmr_query, records=dmr_records
                )

            # Build prompt & predict action
            action_prompt = action_agent.build_prompt(
                replay=replay,
                turn=curr_turn,
                cands_turn=cands_turn,
            )

            next_action = action_agent.next_action(
                turn=curr_turn, uid_key=uid_key, model_prompt=action_prompt
            )

            # Double check our response body
            if (next_action["intent"] in BrowserIntentsWithElements) and (
                not next_action["element"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Bad action - Element not provided when needed",
                )

            # We add the turn
            replay.addInferTurn(curr_turn)

            logger.info(f"Predicted: {next_action}")

            return ResponseBody(**next_action)

    except Exception as e:

        error_message = f"Something bad happened... {traceback.format_exc()}"

        logger.error(error_message)

        raise HTTPException(
            status_code=500,
            detail=error_message,
        )


if __name__ == "__main__":
    try:
        uvicorn.run(app, host="0.0.0.0", port=80)
    except OSError as e:
        print(f"Failed to bind to port: {e}")
