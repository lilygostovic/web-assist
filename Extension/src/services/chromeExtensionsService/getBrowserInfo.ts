import { ErrorToast, InfoToast } from "../../components/CustomToast";

interface Bboxes<> {
  [key: string]: {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
    x: number;
    y: number;
  };
}

interface BrowserInfo {
  tabId: number;
  url: string;
  viewportHeight: number;
  viewportWidth: number;
  zoomLevel: number;
  html: string;
  bboxes: Bboxes;
}

const waitForTabToLoad = (tabId: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    // Check if the tab is already loaded
    chrome.tabs.get(tabId, (tab) => {
      if (!tab) {
        reject(new Error(`Tab with ID ${tabId} not found.`));
      } else if (tab.status === "complete") {
        resolve();
      } else {
        // If the tab is still loading, add an event listener for the onUpdated event
        const listener = (
          updatedTabId: number,
          changeInfo: chrome.tabs.TabChangeInfo
        ) => {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            // Once the tab has finished loading, resolve the promise
            resolve();
            // Remove the event listener to prevent memory leaks
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        // Add the event listener
        chrome.tabs.onUpdated.addListener(listener);
      }
    });
  });
};

export const getBrowserInfo = async (uidKey: string): Promise<BrowserInfo> => {
  // Defaults
  let tabId = -1;
  let url = "";
  let viewportHeight = -1;
  let viewportWidth = -1;
  let zoomLevel = -1;
  let html = "";
  let bboxes = {};

  // Get active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  zoomLevel = await chrome.tabs.getZoom();

  if (tabs.length === 0) {
    ErrorToast({ message: "No active tab was found!" });
  } else {
    const activeTab = tabs[0];
    tabId = activeTab.id || tabId;

    await waitForTabToLoad(tabId);

    url = activeTab.url || url;

    if (url === "") {
      ErrorToast({ message: `URL found was: ${url}` });
    }

    viewportHeight = activeTab.height || viewportHeight;
    viewportWidth = activeTab.width || viewportWidth;

    // Edit current page with the tags + get bounding boxes
    bboxes = await chrome.tabs.sendMessage(tabId, {
      action: "tagElementsAndRetrieveBBox",
      uid: uidKey,
    });

    html = await chrome.tabs.sendMessage(tabId, {
      action: "retrieveHTML",
    });
  }

  return {
    tabId,
    url,
    viewportHeight,
    viewportWidth,
    zoomLevel,
    html,
    bboxes,
  };
};
