import { getBrowserInfo } from "../chromeExtensionsService";
import { ModelName, MousePosition, PrevTurn, ResponseBody } from "../../types";
import { InfoToast } from "../../components/CustomToast";

const requestNextAction = async (
  model: ModelName,
  sessionID: string,
  uidKey: string,
  userIntent: { [key: string]: string },
  prevTurn: PrevTurn | null,
  mousePosition: MousePosition
): Promise<ResponseBody> => {
  const base_url = "http://localhost:8080";
  const API_path = "/v1/get_next_action";

  const { tabId, url, viewportHeight, viewportWidth, zoomLevel, html, bboxes } =
    await getBrowserInfo(uidKey);

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

export const continueExecution = async (
  model: ModelName,
  sessionID: string,
  uidKey: string,
  prevTurn: PrevTurn | null,
  mousePosition: MousePosition
): Promise<ResponseBody> => {
  const userIntent = {
    intent: "continue",
  };
  return requestNextAction(
    model,
    sessionID,
    uidKey,
    userIntent,
    prevTurn,
    mousePosition
  );
};

export const postChat = async (
  model: ModelName,
  sessionID: string,
  uidKey: string,
  newMessage: string,
  prevTurn: PrevTurn | null,
  mousePosition: MousePosition
): Promise<ResponseBody> => {
  const userIntent = {
    intent: "say",
    utterance: newMessage,
  };

  return requestNextAction(
    model,
    sessionID,
    uidKey,
    userIntent,
    prevTurn,
    mousePosition
  );
};
