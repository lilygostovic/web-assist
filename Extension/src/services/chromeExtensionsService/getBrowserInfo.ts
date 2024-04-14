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
    url = activeTab.url || url;
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
