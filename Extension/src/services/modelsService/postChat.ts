import { useChromeExtensionService } from "../";
import { ModelName, PrevTurn } from "../../types";
import { generateSessionID, processHTML } from "./helper";

type MousePosition = {
  x: number;
  y: number;
};

export const postChat = async (
  model: ModelName,
  newMessage: string,
  prevTurn: PrevTurn | null,
  mousePosition: MousePosition
): Promise<PrevTurn> => {
  const { getBrowserInfo, getTabInfo } = useChromeExtensionService();

  const userIntent = {
    intent: "say",
    utterance: newMessage,
  };
  const sessionID = generateSessionID();
  const uidKey = "web-assist-id";
  const base_url = "http://localhost:8080";
  const API_path = "/v1/get_next_action";

  // Gather metadata
  const { tabId, url, zoomLevel } = await getTabInfo();
  const { viewportSize, rawHTML, elementsInfo } = await getBrowserInfo(tabId); //TODO:: elementsInfo is returning all 0s for all bbox elements
  const { html } = await processHTML(uidKey, rawHTML);
  const metadata = {
    mouseX: mousePosition.x,
    mouseY: mousePosition.y,
    tabId,
    url,
    viewportHeight: viewportSize.height,
    viewportWidth: viewportSize.width,
    zoomLevel,
  };

  try {
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
      }),
    });

    const response = await res;
    const json = await response.json();

    alert(response.status);
    alert(JSON.stringify(json));
  } catch (err) {
    console.log(err);
    alert(err);
  }
  // handleAPIResponse(res as GetNextActionResponse);

  return {
    // TODO:: remove dummy response
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
