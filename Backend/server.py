import uvicorn
from fastapi import FastAPI

from pydantic import BaseModel
from typing import List, Optional, Union

from schema import ErrorResponse, ResponseBody, RequestBody


app = FastAPI()


@app.post("/v1/hello")
async def hello_world():
    return {"message": "Hello, World!"}


@app.post("/v1/get_next_action", response_model=Union[ResponseBody, ErrorResponse])
async def get_next_action(request_body: RequestBody):
    # Validate the request body using Pydantic model
    try:
        return ResponseBody(
            intent="say",
            args={"msg": "Echoing back user intent"},
            element="",
        )
    except Exception as e:
        # In case of error, return an ErrorResponse
        return ErrorResponse(error="Internal Server Error", message=str(e))


if __name__ == "__main__":
    try:
        uvicorn.run(app, host="localhost", port=8000)
    except OSError as e:
        print(f"Failed to bind to port: {e}")
