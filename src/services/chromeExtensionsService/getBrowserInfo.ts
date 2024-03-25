import { BrowserInfo } from '../../types';

export const getBrowserInfo = async (): Promise<BrowserInfo> => {
  // Get tabId
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0].id;

  // Check if tabId is defined
  if (typeof tabId !== "number") {
    throw new Error("Tab ID is not a number.");
  }

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
    html: activeTab.result as string,
  };
};
