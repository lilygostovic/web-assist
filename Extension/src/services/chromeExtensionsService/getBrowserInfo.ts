import { BrowserInfo } from "../../types";

export const getBrowserInfo = async (tabId: number): Promise<BrowserInfo> => {
  // Get the active tab
  const [activeTab] = await chrome.scripting.executeScript({
    target: {
      tabId,
    },
    func: () => document.documentElement.outerHTML,
  });

  // Get viewport size
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if tab is defined
  if (!tab || typeof tab.height !== "number" || typeof tab.width !== "number") {
    throw new Error("Viewport size is not available.");
  }

  const viewportSize = {
    height: tab.height,
    width: tab.width,
  };

  return {
    viewportSize,
    rawHTML: activeTab.result as string,
  };
};
