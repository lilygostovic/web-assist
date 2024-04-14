import logging
import lxml
import weblinx as wl

from datetime import datetime
from functools import cached_property, lru_cache
from typing import Dict, Optional, Union

from schema import (
    BoundingBox,
    BrowserIntentEnum,
    Metadata,
    UserIntent,
    UserIntentEnum,
    PrevTurn,
)


class InferTurn(wl.Turn):
    """
    Takes in the Pydantic model and simulates the wl.Turn object
    * Override some properties / methods for easier access.
    """

    def __init__(
        self,
        prev_turn: Union[PrevTurn, UserIntent],
        html: Optional[str],
        bboxes: Optional[Dict[str, BoundingBox]],
        metadata: Optional[Metadata],
        index: int,
        timestamp: float,
        demo_name: str,
    ):
        self.prev_turn = prev_turn
        self.index = index
        self.timestamp_ = timestamp
        self.demo_name = demo_name
        self.base_dir = "fake dir"

        self._html = html
        self._metadata = metadata
        self._bboxes = bboxes

        self.utterance = self.prev_turn.utterance

    @classmethod
    def from_replay(cls, replay: "Replay", index: int):
        raise NotImplementedError

    def __getitem__(self, item):
        return getattr(self, item)

    def get(self, item):
        return getattr(self, item)

    def __str__(self):
        return f"Turn {self.index}: [{self.speaker}] - {self.intent}"

    def __repr__(self):
        return f"Turn {self.index}: [{self.speaker}] - {self.intent}"

    # to have access to .items()
    # doesn't work for @property
    def items(self):
        return vars(self).items()

    # Done for compatibility purposes
    @property
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
        return self._metadata

    @property
    def client_x(self) -> int:
        return None

    @property
    def client_y(self) -> int:
        return None

    @property
    def element(self) -> dict:
        if isinstance(self.prev_turn, UserIntent):
            return None
        else:
            return self.prev_turn.element

    @property
    def props(self) -> dict:
        if isinstance(self.prev_turn, UserIntent):
            return None
        else:
            return {}

    @property
    def bboxes(self) -> dict:
        return self._bboxes

    @property
    def html(self) -> str:
        return self._html

    @property
    def speaker(self) -> str:
        if isinstance(self.prev_turn, UserIntent):
            return "instructor"
        return "navigator"

    def validate(self) -> bool:
        # Prev turn is already validated
        return True

    def has_screenshot(self):
        raise NotImplementedError

    def has_html(self) -> bool:
        return self._html is not None

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
        if not self.html:
            return {}

        tree = lxml.html.fromstring(self._html)
        root = tree.getroottree()

        elems = root.xpath(f"//*[@{uid_key}]")

        logging.debug(f"xpath:  //*[@{uid_key}]")

        if len(elems) == 0:
            return {}

        xpaths = {}

        for elem in elems:
            uid = elem.attrib[uid_key]
            xpath = root.getpath(elem)
            xpaths[uid] = xpath

        logging.debug(f"xpaths ({len(xpaths)}): {list(xpaths.keys())[:10]}")
        logging.debug(f"bboxes elements: {len(self._bboxes)}")

        return xpaths

    def get_element_xpath(
        self,
        uid: str,
        uid_key="data-webtasks-id",
    ):
        if not self.html:
            return ""

        tree = lxml.html.fromstring(self._html)
        root = tree.getroottree()

        elems = root.xpath(f'//*[@{uid_key}="{uid}"]')

        if len(elems) == 0:
            return ""

        return root.getpath(elems[0])

    def get_element_bbox(self, uid: str):

        logging.debug(f"Bboxes ({len(self._bboxes)}: {list(self._bboxes.keys())[:10]}")

        if uid in self._bboxes:
            return self._bboxes[uid]
        else:
            logging.debug(f"Could not find UID {uid} in bboxes.")
            return BoundingBox(
                bottom=0, height=0, left=0, right=0, top=0, width=0, x=0, y=0
            )


class InferReplay(wl.Replay):
    """
    Takes in the Pydantic model and simulates the wl.Replay object
    * Override some properties / methods for easier access.
    """

    def __init__(
        self,
        session_id: str,
    ):
        self.session_id = session_id
        self.demo_name = session_id
        self.base_dir = "fake dir"
        self.turns = []
        self.start = datetime.now()
        self.index = 0

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
        return self.__str__

    def __str__(self):
        str_rep = f"Replay session `{self.session_id}` with {len(self)} turns.\n"
        for t in self.turns:
            str_rep += f"\t {t}\n"
        return str_rep

    def __iter__(self):
        return iter(self.turns)

    @classmethod
    def from_demonstration(cls, demonstration: wl.Demonstration):
        raise NotImplementedError

    def buildInferTurn(
        self,
        turn: Union[PrevTurn, UserIntent],
        html: Optional[str],
        bboxes: Optional[Dict[str, BoundingBox]],
        metadata: Optional[Metadata],
    ) -> InferTurn:
        """
        Builds the turn
        **Does not** append to replay
        """
        result = InferTurn(
            prev_turn=turn,
            html=html,
            bboxes=bboxes,
            metadata=metadata,
            index=self.index,
            timestamp=(datetime.now() - self.start).total_seconds(),
            demo_name=self.session_id,
        )
        return result

    def addInferTurn(
        self,
        turn: InferTurn,
    ):
        """
        Adds Infer Turn into the replay
        """
        # update turn.index if needed

        turn.index = self.index
        self.turns.append(turn)
        self.index += 1

        logging.info(
            f"Added Turn `[{turn.speaker}] - {turn.intent}` into Replay at index {turn.index} "
        )

    def build_add_InferTurn(
        self,
        prev_turn: Union[PrevTurn, UserIntent],
        html: Optional[str],
        bboxes: Optional[Dict[str, BoundingBox]],
        metadata: Optional[Metadata],
    ):
        """
        Builds the turn & add into the replay
        """
        turn = self.buildInferTurn(prev_turn, html, bboxes, metadata)
        self.addInferTurn(turn)

    def remove_lastInferTurn(self):
        """Removes the last infer turn"""
        prev_turn = self.turns.pop()
        self.index -= 1

        logging.info(
            f"Removing turn `[{prev_turn.speaker}] - {prev_turn.intent}` from Replay at index {prev_turn.index} "
        )
        return prev_turn

    def get_lastInferTurn(self):
        """Gets the last infer turn"""
        prev_turn = self.turns[-1]

        logging.info(
            f"Retrieving turn `[{prev_turn.speaker}] - {prev_turn.intent}` from Replay at index {prev_turn.index} "
        )
        return prev_turn
