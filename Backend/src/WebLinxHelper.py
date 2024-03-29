from functools import cached_property, lru_cache
from typing import Dict, Union
import weblinx as wl
from .schema import BrowserIntentEnum, UserIntent, UserIntentEnum, PrevTurn


class InferReplay(wl.Replay):
    """
    Takes in the Pydantic model and simulates the wl.Replay object
    * Override some properties / methods for easier access.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.turns = []

    def __getitem__(self, key):
        if isinstance(key, slice):
            return [self[i] for i in range(*key.indices(len(self)))]

        if key < 0:
            key = len(self) + key

        elif key > len(self) - 1:
            raise IndexError(
                f"Turn index {key} out of range. The replay has {len(self)} turns, so the last index is {len(self) - 1}."
            )

        return self.turns[key]

    def __len__(self):
        return len(self.turns)

    def __repr__(self):
        return f"InferReplay | Session `{self.session_id}` | Total Turns: [{len(self)}]"

    def __iter__(self):
        return iter(self.turns)

    @classmethod
    def from_demonstration(cls, demonstration: wl.Demonstration):
        raise NotImplementedError

    def appendTurn(self, turn: wl.Turn):
        """
        Appends the turn to the replay object.
        Does not make sure the index is correct.
        """
        self.turns.append(turn)


class InferTurn(wl.Turn):
    """
    Takes in the Pydantic model and simulates the wl.Turn object
    * Override some properties / methods for easier access.
    """

    def __init__(
        self, prev_turn: Union[PrevTurn, UserIntent], index: int, timestamp=float
    ):
        self.prev_turn = prev_turn
        self.index = index
        self.timestamp_ = timestamp

    @classmethod
    def from_replay(cls, replay: "Replay", index: int):
        raise NotImplementedError

    def __getitem__(self, item):
        return getattr(self, item)

    def get(self, item):
        return getattr(self, item)

    # Done for compatibility purposes
    @cached_property
    def args(self) -> dict:

        if self.intent == BrowserIntentEnum.say:
            return None

        result = {}
        if self.metadata:
            result["metadata"] = self.metadata
        if self.props:
            result["properties"] = self.props
        if self.element:
            result["element"] = self.element
        if self.scrollX:
            result["scrollX"] = self.scrollX
        if self.scrollY:
            result["scrollY"] = self.scrollY

        return result

    @property
    def type(self) -> str:
        """
        Type of the turn, either 'chat' or 'browser'
        """
        type = "browser"
        if (self.intent == BrowserIntentEnum.say) or (
            self.intent == UserIntentEnum.say
        ):
            type = "chat"
        return type

    @property
    def timestamp(self) -> float:
        """
        Number of seconds since the start of the demonstration
        """
        return self.timestamp_

    @property
    def intent(self) -> str:
        return self.prev_turn.intent

    @property
    def metadata(self) -> dict:
        return self.prev_turn.get("metadata")

    @property
    def client_x(self) -> int:
        raise NotImplementedError

    @property
    def client_y(self) -> int:
        raise NotImplementedError

    @property
    def element(self) -> dict:
        return self.prev_turn.get("element")

    @property
    def props(self) -> dict:
        return self.prev_turn.get("properties")

    @property
    def bboxes(self) -> dict:
        return self.prev_turn.get("bboxes")

    @property
    def html(self) -> str:
        return self.prev_turn.get("html")

    @property
    def speaker(self) -> str:
        if type(self.prev_turn) == UserIntent:
            return "instructor"
        return "navigator"

    @property
    def utterance(self) -> str:
        return self.prev_turn.get("utterance")

    def validate(self) -> bool:
        # Prev turn is already validated
        return True

    def has_screenshot(self):
        raise NotImplementedError

    def has_html(self) -> bool:
        return self.html is not None

    def has_bboxes(self, subdir: str = "bboxes", page_subdir: str = "pages"):
        return self.bboxes is not None

    def get_screenshot_path(
        self,
        subdir: str = "screenshots",
        return_str: bool = True,
        throw_error: bool = True,
    ):
        raise NotImplementedError

    def get_html_path():
        raise NotImplementedError

    def get_bboxes_path(
        self, subdir="bboxes", page_subdir="pages", throw_error: bool = True
    ):
        raise NotImplementedError

    def get_screenshot_status(self):
        raise NotImplementedError

    def get_xpaths_dict(
        self,
        uid_key="data-webtasks-id",
        cache_dir=None,
        allow_save=True,
        check_hash=False,
        parser="lxml",
        json_backend="auto",
    ):
        raise NotImplementedError
