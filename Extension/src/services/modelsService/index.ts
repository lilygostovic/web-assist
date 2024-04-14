import { getBrowserInfo, getMousePosition } from "../chromeExtensionsService";
import {
  ChatMessage,
  LoadPrevTurn,
  PrevTurn,
  PrevTurnWithElement,
  ResponseBody,
  ScrollPrevTurn,
} from "../../types";
import { ErrorToast, InfoToast } from "../../components/CustomToast";

// TODO: some error with bboxes after loading url
// TODO: throw error of HTTP status isn't 200
const requestNextAction = async (
  model: string,
  sessionID: string,
  uidKey: string,
  userIntent: { [key: string]: string },
  prevTurn: PrevTurn | null
): Promise<ResponseBody> => {
  const base_url = "http://localhost:8080";
  const API_path = "/v1/get_next_action";

  const { tabId, url, viewportHeight, viewportWidth, zoomLevel, html, bboxes } =
    await getBrowserInfo(uidKey);

  const mousePosition = getMousePosition();

  const metadata = {
    mouseX: mousePosition.x,
    mouseY: mousePosition.y,
    tabId,
    url,
    viewportHeight,
    viewportWidth,
    zoomLevel,
  };

  const res = await fetch(base_url + API_path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_intent: userIntent,
      sessionID,
      uid_key: uidKey,
      prev_turn: prevTurn,
      html: html,
      metadata: metadata,
      bboxes: bboxes,
    }),
  });

  const json = await res.json();

  // Enable for debugging
  // InfoToast({
  //   message: `Response: ${res.status} - ${JSON.stringify(json)}`,
  // });

  // Check if the status code is not 200
  if (res.status !== 200) {
    throw new Error(`HTTP status code: ${res.status} ${JSON.stringify(json)}`);
  }

  return json;
};

export const performAction = async (
  res: ResponseBody,
  uidKey: string,
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setPrevTurn: React.Dispatch<React.SetStateAction<null | PrevTurn>>
): Promise<void> => {
  const { intent, args, element } = res;

  // Update our history appropriately
  const newMessage = {
    speaker: intent === "say" ? "model" : "action",
    content:
      intent === "say"
        ? args.utterance
        : `Attempting to ${intent} with args: ${JSON.stringify(args)}`,
  } as ChatMessage;
  setHistory((prevHistory) => [newMessage, ...prevHistory]);

  // Perform action and update Prev Turn
  if (intent === "say") {
    setPrevTurn({
      intent: intent,
      utterance: args.utterance,
    });
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) {
    ErrorToast({ message: "No active tab was found!" });
  }

  const activeTab = tabs[0];
  const tabId = activeTab.id as number;

  let message = { intent: intent } as PrevTurn;

  switch (intent) {
    case "scroll":
      message = {
        intent: intent,
        scrollX: args.scrollX,
        scrollY: args.scrollY,
      } as ScrollPrevTurn;
      await chrome.tabs.sendMessage(tabId, message);
      setPrevTurn(message);
      break;
    case "load":
      message = {
        intent: intent,
        url: args.url,
      } as LoadPrevTurn;
      await chrome.tabs.sendMessage(tabId, message);
      setPrevTurn(message);
      break;
    case "click":
      await chrome.tabs.sendMessage(tabId, {
        intent: intent,
        uidKey: uidKey,
        uid: args.uid,
      });
      setPrevTurn({
        intent: intent,
        element: element,
      });
      break;
    case "submit":
      await chrome.tabs.sendMessage(tabId, {
        intent: intent,
        uidKey: uidKey,
        uid: args.uid,
      });
      setPrevTurn({
        intent: intent,
        element: element,
      });
      break;
    case "change":
      await chrome.tabs.sendMessage(tabId, {
        intent: intent,
        uidKey: uidKey,
        uid: args.uid,
      });
      setPrevTurn({
        intent: intent,
        element: element,
      });
      break;
    case "textinput":
      await chrome.tabs.sendMessage(tabId, {
        intent: intent,
        uidKey: uidKey,
        uid: args.uid,
        text: args.text,
      });
      setPrevTurn({
        intent: intent,
        element: element,
      });
      break;
  }
};

export const continueExecution = async (
  model: string,
  sessionID: string,
  uidKey: string,
  prevTurn: PrevTurn | null
): Promise<ResponseBody> => {
  const userIntent = {
    intent: "continue",
  };

  return requestNextAction(model, sessionID, uidKey, userIntent, prevTurn);
};

export const postChat = async (
  model: string,
  sessionID: string,
  uidKey: string,
  newMessage: string,
  prevTurn: PrevTurn | null
): Promise<ResponseBody> => {
  const userIntent = {
    intent: "say",
    utterance: newMessage,
  };

  return requestNextAction(model, sessionID, uidKey, userIntent, prevTurn);
};
