from enum import Enum
from typing import Any, Optional, Dict, Union, List
from pydantic import BaseModel, validator, model_validator

### User Intent ###########


class UserIntentEnum(str, Enum):
    chat = "chat"
    continue_ = "continue"


class UserIntent(BaseModel):
    intent: UserIntentEnum
    utterance: Optional[str] = None


#######################################################


class BoundingBox(BaseModel):
    bottom: float
    height: float
    left: float
    right: float
    top: float
    width: float
    x: float
    y: float


class Element(BaseModel):
    attributes: Dict[str, Any]
    bbox: BoundingBox
    tagName: str
    xpath: str
    textContent: str


class Metadata(BaseModel):
    mouseX: int
    mouseY: int
    tabId: float  # use float in case the integer is too large
    url: str
    viewportHeight: int
    viewportWidth: int
    zoomLevel: int


class TransitionProperties(BaseModel):
    transitionType: Optional[str] = None
    transitionQualifiers: Optional[List[str]] = None


########################################
class BrowserIntentEnum(str, Enum):
    change = "change"
    click = "click"
    load = "load"
    say = "say"
    scroll = "scroll"
    submit = "submit"
    textInput = "textinput"


class PrevTurn(BaseModel):
    intent: BrowserIntentEnum

    html: Optional[str] = None
    metadata: Optional[Metadata] = None
    element: Optional[Element] = None

    properties: Optional[TransitionProperties] = None

    scrollX: Optional[int] = None
    scrollY: Optional[int] = None

    utterance: Optional[str] = None


def raise_field_error(field_name, param_name, intent):
    raise ValueError(
        f"Field `{field_name}` should be in {param_name} if intent is {intent}."
    )


class RequestBody(BaseModel):
    user_intent: UserIntent
    sessionID: str
    uid_key: str
    prev_turn: Optional[PrevTurn] = None

    @model_validator(mode="after")
    def validate_utterance_in_user_chat_intent(self):
        intent = self.user_intent.intent

        if (intent == UserIntentEnum.chat) and (not self.user_intent.utterance):
            raise_field_error("utterance", "user_intent", intent)

        return self

    @model_validator(mode="after")
    def validate_required_fields_in_param(self):

        # None is allowed
        if not self.prev_turn:
            return self

        intent = self.prev_turn.intent

        # Say
        if intent == BrowserIntentEnum.say:
            if not self.prev_turn.utterance:
                raise_field_error("utterance", "prev_turn", intent)
            else:
                return self

        # Rest must have html and metadata
        browser_intents = [
            BrowserIntentEnum.change,
            BrowserIntentEnum.click,
            BrowserIntentEnum.load,
            BrowserIntentEnum.scroll,
            BrowserIntentEnum.submit,
            BrowserIntentEnum.textInput,
        ]
        if intent in browser_intents:
            if not self.prev_turn.html:
                raise_field_error("html", "prev_turn", intent)

            if not self.prev_turn.metadata:
                raise_field_error("metadata", "prev_turn", intent)

        # Check for element
        browser_element_intents = [
            BrowserIntentEnum.change,
            BrowserIntentEnum.click,
            BrowserIntentEnum.submit,
            BrowserIntentEnum.textInput,
        ]
        if (intent in browser_element_intents) and (not self.prev_turn.element):
            raise_field_error("element", "prev_turn", intent)

        # Check for scroll
        if intent in BrowserIntentEnum.scroll:
            if not self.prev_turn.scrollX:
                raise_field_error("scrollX", "prev_turn", intent)
            if not self.prev_turn.scrollY:
                raise_field_error("scrollY", "prev_turn", intent)

        return self


##########################################################


class ResponseBody(BaseModel):
    intent: BrowserIntentEnum
    args: Dict[str, Any]
    element: str


class ErrorResponse(BaseModel):
    error: str
    message: str
