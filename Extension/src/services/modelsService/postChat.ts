import { ModelName, PrevTurn } from "../../types";
import { getBrowserInfo } from "../chromeExtensionsService";
import {
  generateSessionID,
  getMouseCoordinates,
  getTabInfo,
  processHTML,
} from "./helper";

export const postChat = async (
  model: ModelName,
  newMessage: string,
  prevTurn: PrevTurn | null
): Promise<PrevTurn> => {
  const userIntent = {
    type: "chat",
    utterance: newMessage,
  };
  const sessionID = generateSessionID();
  const uidKey = "web-assist-id";

  // Gather metadata
  const { tabId, url, zoomLevel } = await getTabInfo(); //TODO:: not sure if zoomLevel is being set correctly
  const { viewportSize, rawHTML, elementsInfo } = await getBrowserInfo(tabId); //TODO:: elementsInfo is returning all 0s for all bbox elements
  const { html } = await processHTML(uidKey, rawHTML);
  const { mouseX, mouseY } = getMouseCoordinates(); //TODO:: this is not rendering properly
  const metadata = {
    mouseX,
    mouseY,
    tabId,
    url,
    viewportHeight: viewportSize.height,
    viewportWidth: viewportSize.width,
    zoomLevel,
  };

  // Call backend model

  return {
    // TODO:: remove dummy response
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
