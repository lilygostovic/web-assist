import { ChatMessage, ModelName } from "../../types";
import { getBrowserInfo } from "../chromeExtensionsService";

export const callModel = async (
  model: ModelName,
  newMessage: string,
  history: ChatMessage[]
): Promise<ChatMessage[]> => {
  // Get browser information
  const { viewportSize, html } = await getBrowserInfo();

  // Get recent history
  const lastFiveChats = history.slice(-5);

  // Call to backend
  //   const res = await ...
  const res = [
    "Hello, thank you for using my assistance.",
    "Please provide your last 4 digits of your social insurance number.",
  ];

  return res.map((text) => {
    return { content: text, speaker: "model" };
  });
};
