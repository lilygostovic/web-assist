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

  // TODO:: Remove if not using or make work
  // Initialize properties with base properties
  // let properties: Properties = {
  //   transitionQualifiers: undefined,
  //   transitionType: undefined,
  // };
  // if (prevTurn?.intent === "load") {
  //   const { transitionQualifiers, transitionType } = await getNavigationInfo(
  //     tabId
  //   );
  //   properties = {
  //     ...properties,
  //     transitionQualifiers,
  //     transitionType,
  //   };
  // }

  // Call backend model

  return {
    // TODO:: remove dummy response
    intent: "say",
    utterance: "Thank you for using my services.",
  };
};
