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
    type: "chat",
    utterance: newMessage,
  };
  const sessionID = generateSessionID();
  const uidKey = "web-assist-id";

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

  const res = await fetch("https://localhost:8080/v1/get_next_action", {
    method: "POST",
    body: JSON.stringify({
      user_intent: userIntent,
      sessionID,
      uid_key: uidKey,
      prev_turn: prevTurn === null ? undefined : prevTurn,
    }),
  });

  const json = await res.json();

  console.log(res);
  console.log(res.body);
  console.log(res.status);
  console.log(json);

  // handleAPIResponse(res as GetNextActionResponse);

  return {
    // TODO:: remove dummy response
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
