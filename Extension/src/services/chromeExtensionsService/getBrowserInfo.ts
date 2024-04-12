import { ErrorToast, InfoToast } from "../../components/CustomToast";
import { injectScript } from "./injectScript";

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

const generateUID = (): string => {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

// TODO: Check if the document is referring to the react document / html page of the tab.
const tagElementsAndRetrieveBBox = (uidKey: string): Bboxes => {
  // get all elements
  const elements = document.querySelectorAll("*");
  let boundingBoxes: Bboxes = {};

  // Loop through each element and add attribute
  elements.forEach((element) => {
    const uid = generateUID();
    const bbox = element.getBoundingClientRect();

    element.setAttribute(uidKey, uid);
    boundingBoxes[`${uid}`] = {
      bottom: bbox.bottom,
      height: bbox.height,
      left: bbox.left,
      right: bbox.right,
      top: bbox.top,
      width: bbox.width,
      x: bbox.x,
      y: bbox.y,
    };
  });

  return boundingBoxes;
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
    url = activeTab.url || url;
    viewportHeight = activeTab.height || viewportHeight;
    viewportWidth = activeTab.width || viewportWidth;

    // Edit current page with the tags + get bounding boxes
    bboxes = tagElementsAndRetrieveBBox(uidKey);
    // retrieve HTML after the edit
    html = document.documentElement.outerHTML;
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
