import { getBrowserInfo, getMousePosition } from "../chromeExtensionsService";
import {
  ChatMessage,
  LoadPrevTurn,
  PrevTurn,
  ResponseBody,
  ScrollPrevTurn,
} from "../../types";
import { ErrorToast, InfoToast } from "../../components/CustomToast";

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

  InfoToast({
    message: `Response: ${res.status} - ${JSON.stringify(json)}`,
  });

  return json;
};

export const performAction = async (
  res: ResponseBody,
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
      break;
    case "load":
      message = {
        intent: intent,
        url: args.url,
      } as LoadPrevTurn;
      break;
    default:
      InfoToast({ message: "PrevTurnWithElement" });
  }

  chrome.tabs.sendMessage(tabId, message);
  setPrevTurn(message);
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
