import { getBrowserInfo } from "../chromeExtensionsService";
import { ModelName, MousePosition, PrevTurn } from "../../types";
import { generateSessionID, processHTML } from "./helper";
import { ErrorToast, InfoToast } from "../../components/CustomToast";

export const postChat = async (
  model: ModelName,
  newMessage: string,
  prevTurn: PrevTurn | null,
  mousePosition: MousePosition
): Promise<PrevTurn> => {
  // TODO: Fix sessionID -> should not change unless we clear conversation
  const sessionID = generateSessionID();
  const uidKey = "web-assist-id";
  const base_url = "http://localhost:8080";
  const API_path = "/v1/get_next_action";

  const userIntent = {
    intent: "say",
    utterance: newMessage,
  };

  try {
    const {
      tabId,
      url,
      viewportHeight,
      viewportWidth,
      zoomLevel,
      html,
      bboxes,
    } = await getBrowserInfo(uidKey);

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

    const response = await res;
    const json = await response.json();

    InfoToast({
      message: `Response: ${response.status} - ${JSON.stringify(json)}`,
    });
  } catch (err) {
    ErrorToast({
      message: `Error: ${err}`,
    });
  }

  // handleAPIResponse(res as GetNextActionResponse);

  return {
    // TODO:: remove dummy response
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
