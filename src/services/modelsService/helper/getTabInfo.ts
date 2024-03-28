export const getTabInfo = async (): Promise<{
  tabId: number;
  url: string;
  zoomLevel: number;
}> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tabs.length === 0) {
    throw new Error("No active tab found.");
  }

  const { id: tabId, url } = tabs[0];

  // Check if tabId is defined
  if (typeof tabId !== "number") {
    throw new Error("Tab ID is not a number.");
  }

  // Check if url is defined
  if (typeof url !== "string") {
    throw new Error("Url is not a string.");
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => window.devicePixelRatio,
  });

  const zoomFactor = typeof result === "number" ? result : 1;

  return { tabId, url, zoomLevel: zoomFactor };
};
