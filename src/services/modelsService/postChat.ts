import { ModelName, PrevTurn } from "../../types";
import { getBrowserInfo } from "../chromeExtensionsService";
import { getMouseCoordinates, getTabInfo, processHTML } from "./helper";

export const postChat = async (
  model: ModelName,
  newMessage: string,
  prevTurn: PrevTurn | null,
  sessionID: number
): Promise<PrevTurn> => {
  const userIntent = {
    type: "chat",
    utterance: newMessage,
  };
  const uidKey = "web-assist-id";

  const element = {}; //TODO:: how should this be set

  // Gather metadata
  const { tabId, url, zoomLevel } = await getTabInfo(); //TODO:: not sure if zoomLevel is being set correctly
  const { viewportSize, rawHTML } = await getBrowserInfo(tabId);
  const { html, elementMap } = await processHTML(uidKey, rawHTML); //TODO:: elementMap is always all 0s
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

  const properties = {
    tabId, // TODO:: do we need this to be sent again?
    url, // TODO:: do we need this to be sent again?
    // TODO:: add transitionQualifiers and transitionType if prevTurn.intent is load
  };

  //

  // =========================================================================================

  //

  // Call backend model

  return {
    type: "chat",
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
