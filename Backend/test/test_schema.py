import pytest
from schema import (
    UserIntentEnum,
    UserIntent,
    BoundingBox,
    Element,
    Metadata,
    TransitionProperties,
    BrowserIntentEnum,
    PrevTurn,
    RequestBody,
)


class TestUserIntentModel:
    def test_user_intent_required(self):
        with pytest.raises(ValueError):
            UserIntent(utterance="Hello")

    def test_user_intent_chat_requires_utterance(self):
        with pytest.raises(ValueError):
            UserIntent(intent=UserIntentEnum.chat)

    def test_user_intent_continue_no_utterance(self):
        user_intent = UserIntent(intent=UserIntentEnum.continue_)
        assert user_intent.intent == UserIntentEnum.continue_
        assert user_intent.utterance is None

    def test_user_intent_chat_requires_utterance(self):
        user_intent = UserIntent(intent=UserIntentEnum.chat, utterance="Hello")
        assert user_intent.intent == UserIntentEnum.chat
        assert user_intent.utterance == "Hello"


class TestElementModel:
    valid_bbox = BoundingBox(
        bottom=10, height=20, left=5, right=15, top=5, width=10, x=5, y=5
    )
    valid_attributes = {"class": "test-class"}
    valid_tagName = "div"
    valid_xpath = "//div"
    valid_textContent = "Test content"

    def test_element_required_fields(self):
        with pytest.raises(ValueError):
            Element()

    def test_attributes_required(self):
        with pytest.raises(ValueError):
            Element(
                bbox=self.valid_bbox,
                tagName=self.valid_tagName,
                xpath=self.valid_xpath,
                textContent=self.valid_textContent,
            )

    def test_bbox_required(self):
        with pytest.raises(ValueError):
            Element(
                attributes=self.valid_attributes,
                tagName=self.valid_tagName,
                xpath=self.valid_xpath,
                textContent=self.valid_textContent,
            )

    def test_tagName_required(self):
        with pytest.raises(ValueError):
            Element(
                attributes=self.valid_attributes,
                bbox=self.valid_bbox,
                xpath=self.valid_xpath,
                textContent=self.valid_textContent,
            )

    def test_xpath_required(self):
        with pytest.raises(ValueError):
            Element(
                attributes=self.valid_attributes,
                bbox=self.valid_bbox,
                tagName=self.valid_tagName,
                textContent=self.valid_textContent,
            )

    def test_textContent_required(self):
        with pytest.raises(ValueError):
            Element(
                attributes=self.valid_attributes,
                bbox=self.valid_bbox,
                tagName=self.valid_tagName,
                xpath=self.valid_xpath,
            )

    def test_element_creation(self):
        element = Element(
            attributes=self.valid_attributes,
            bbox=self.valid_bbox,
            tagName=self.valid_tagName,
            xpath=self.valid_xpath,
            textContent=self.valid_textContent,
        )
        assert element.attributes == self.valid_attributes
        assert element.bbox == self.valid_bbox
        assert element.tagName == self.valid_tagName
        assert element.xpath == self.valid_xpath
        assert element.textContent == self.valid_textContent


class TestBoundingBoxModel:
    valid_bottom = 10
    valid_height = 20
    valid_left = 5
    valid_right = 15
    valid_top = 5
    valid_width = 10
    valid_x = 5
    valid_y = 5

    def test_bottom_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                height=self.valid_height,
                left=self.valid_left,
                right=self.valid_right,
                top=self.valid_top,
                width=self.valid_width,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_height_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                left=self.valid_left,
                right=self.valid_right,
                top=self.valid_top,
                width=self.valid_width,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_left_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                right=self.valid_right,
                top=self.valid_top,
                width=self.valid_width,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_right_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                left=self.valid_left,
                top=self.valid_top,
                width=self.valid_width,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_top_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                left=self.valid_left,
                right=self.valid_right,
                width=self.valid_width,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_width_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                left=self.valid_left,
                right=self.valid_right,
                top=self.valid_top,
                x=self.valid_x,
                y=self.valid_y,
            )

    def test_x_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                left=self.valid_left,
                right=self.valid_right,
                top=self.valid_top,
                width=self.valid_width,
                y=self.valid_y,
            )

    def test_y_required(self):
        with pytest.raises(ValueError):
            BoundingBox(
                bottom=self.valid_bottom,
                height=self.valid_height,
                left=self.valid_left,
                right=self.valid_right,
                top=self.valid_top,
                width=self.valid_width,
                x=self.valid_x,
            )


class TestMetadataModel:
    valid_mouseX = 0
    valid_mouseY = 0
    valid_tabId = 2011645173
    valid_url = "https://www.example.com"
    valid_viewportHeight = 1080
    valid_viewportWidth = 1920
    valid_zoomLevel = 1

    def test_mouseX_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseY=self.valid_mouseY,
                tabId=self.valid_tabId,
                url=self.valid_url,
                viewportHeight=self.valid_viewportHeight,
                viewportWidth=self.valid_viewportWidth,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_mouseY_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                tabId=self.valid_tabId,
                url=self.valid_url,
                viewportHeight=self.valid_viewportHeight,
                viewportWidth=self.valid_viewportWidth,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_tabId_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                mouseY=self.valid_mouseY,
                url=self.valid_url,
                viewportHeight=self.valid_viewportHeight,
                viewportWidth=self.valid_viewportWidth,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_url_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                mouseY=self.valid_mouseY,
                tabId=self.valid_tabId,
                viewportHeight=self.valid_viewportHeight,
                viewportWidth=self.valid_viewportWidth,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_viewportHeight_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                mouseY=self.valid_mouseY,
                tabId=self.valid_tabId,
                url=self.valid_url,
                viewportWidth=self.valid_viewportWidth,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_viewportWidth_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                mouseY=self.valid_mouseY,
                tabId=self.valid_tabId,
                url=self.valid_url,
                viewportHeight=self.valid_viewportHeight,
                zoomLevel=self.valid_zoomLevel,
            )

    def test_zoomLevel_required(self):
        with pytest.raises(ValueError):
            Metadata(
                mouseX=self.valid_mouseX,
                mouseY=self.valid_mouseY,
                tabId=self.valid_tabId,
                url=self.valid_url,
                viewportHeight=self.valid_viewportHeight,
                viewportWidth=self.valid_viewportWidth,
            )


class TestTransitionPropertiesModel:
    valid_transitionType = "fade"
    valid_transitionQualifiers = ["slow", "smooth"]

    def test_transitionType_optional(self):
        transition_properties = TransitionProperties(
            transitionQualifiers=self.valid_transitionQualifiers
        )
        assert transition_properties.transitionType is None

    def test_transitionQualifiers_optional(self):
        transition_properties = TransitionProperties(
            transitionType=self.valid_transitionType
        )
        assert transition_properties.transitionQualifiers == []

    def test_valid_transitionType_and_transitionQualifiers(self):
        transition_properties = TransitionProperties(
            transitionType=self.valid_transitionType,
            transitionQualifiers=self.valid_transitionQualifiers,
        )
        assert transition_properties.transitionType == self.valid_transitionType
        assert (
            transition_properties.transitionQualifiers
            == self.valid_transitionQualifiers
        )


class TestPrevTurnModel:
    valid_html = "<html><body>Your HTML content</body></html>"
    valid_metadata = Metadata(
        mouseX=0,
        mouseY=0,
        tabId=2011645173,
        url="https://www.google.com/search?q=wealthsimple+tax calculator",
        viewportHeight=651,
        viewportWidth=1366,
        zoomLevel=1,
    )
    valid_element = Element(
        attributes={"class": "mr-xs", "web-assist-id": "44c539a8-1434-4fa6"},
        bbox=BoundingBox(
            bottom=522.1875,
            height=23,
            left=122.5,
            right=244.75,
            top=499.1875,
            width=122.25,
            x=122.5,
            y=499.1875,
        ),
        tagName="SPAN",
        xpath='id("main")/div[1]/div[3]/form[1]/div[1]/div[1]/div[1]/div[5]/div[1]/label[1]/span[1]',
        textContent="xxx",
    )

    @pytest.fixture
    def prev_turn_instance(self):
        return PrevTurn()

    def test_prev_turn_required_fields_none(self, prev_turn_instance):
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_say_intent(self, prev_turn_instance):
        prev_turn_instance.intent = BrowserIntentEnum.say
        prev_turn_instance.utterance = "Hello"
        prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_missing_html(self, prev_turn_instance):
        prev_turn_instance.intent = BrowserIntentEnum.click
        prev_turn_instance.metadata = self.valid_metadata
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_missing_metadata(self, prev_turn_instance):
        prev_turn_instance.intent = BrowserIntentEnum.click
        prev_turn_instance.html = self.valid_html
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_missing_element(self, prev_turn_instance):
        prev_turn_instance.intent = BrowserIntentEnum.click
        prev_turn_instance.html = self.valid_html
        prev_turn_instance.metadata = self.valid_metadata
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_scroll_intent_missing_scrollX(
        self, prev_turn_instance
    ):
        prev_turn_instance.intent = BrowserIntentEnum.scroll
        prev_turn_instance.scrollY = 100
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_scroll_intent_missing_scrollY(
        self, prev_turn_instance
    ):
        prev_turn_instance.intent = BrowserIntentEnum.scroll
        prev_turn_instance.scrollX = 100
        with pytest.raises(ValueError):
            prev_turn_instance.validate_required_fields_in_param()

    def test_prev_turn_required_fields_scroll_intent(self, prev_turn_instance):
        prev_turn_instance.intent = BrowserIntentEnum.scroll
        prev_turn_instance.scrollX = 100
        prev_turn_instance.scrollY = 100
        prev_turn_instance.validate_required_fields_in_param()


class TestRequestBodyModel:
    valid_user_intent_chat = UserIntent(intent=UserIntentEnum.chat, utterance="Hello")
    valid_prev_turn = PrevTurn(
        intent=BrowserIntentEnum.click,
        html="<html><body>Your HTML content</body></html>",
        metadata=Metadata(
            mouseX=0,
            mouseY=0,
            tabId=2011645173,
            url="https://www.google.com/search?q=wealthsimple+tax calculator",
            viewportHeight=651,
            viewportWidth=1366,
            zoomLevel=1,
        ),
        element=Element(
            attributes={"class": "mr-xs", "web-assist-id": "44c539a8-1434-4fa6"},
            bbox=BoundingBox(
                bottom=522.1875,
                height=23,
                left=122.5,
                right=244.75,
                top=499.1875,
                width=122.25,
                x=122.5,
                y=499.1875,
            ),
            tagName="SPAN",
            xpath='id("main")/div[1]/div[3]/form[1]/div[1]/div[1]/div[1]/div[5]/div[1]/label[1]/span[1]',
            textContent="xxx",
        ),
    )

    def test_user_intent_required(self):
        with pytest.raises(ValueError):
            RequestBody(sessionID="123456789", uid_key="web-assist-id")

    def test_sessionID_required(self):
        with pytest.raises(ValueError):
            RequestBody(
                user_intent=self.valid_user_intent_chat, uid_key="web-assist-id"
            )

    def test_uid_key_required(self):
        with pytest.raises(ValueError):
            RequestBody(user_intent=self.valid_user_intent_chat, sessionID="123456789")

    def test_prev_turn_required(self):
        # Test when prev_turn is missing
        data = {
            "user_intent": self.valid_user_intent_chat,
            "sessionID": "123456789",
            "uid_key": "web-assist-id",
        }
        with pytest.raises(ValueError):
            RequestBody(**data)
