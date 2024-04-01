import { BrowserInfo, ElementInfo } from "../../types";

export const getBrowserInfo = async (tabId: number): Promise<BrowserInfo> => {
  // Get the active tab and elements info
  const [activeTab] = await chrome.scripting.executeScript({
    target: {
      tabId,
    },
    func: () => {
      // Get HTML
      const html = document.documentElement.outerHTML;

      // Get elements TODO:: this method of accessing bboxes from elements is returning all 0s
      const elements: ElementInfo[] = Array.from(
        document.querySelectorAll("*")
      ).map((element) => ({
        tagName: element.tagName,
        boundingClientRect: element.getBoundingClientRect(),
      }));

      return { html, elements };
    },
  });

  // Type check activeTab
  if (activeTab.result === undefined) {
    throw new Error("Active Tab is not available.");
  }

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

  const elementsInfo: ElementInfo[] = activeTab.result.elements;
  // elementsInfo.forEach((element, index) => {
  //   alert("Element " + index + ": " + JSON.stringify(element));
  // });

  return {
    viewportSize,
    rawHTML: activeTab.result.html as string,
    elementsInfo,
  };
};
