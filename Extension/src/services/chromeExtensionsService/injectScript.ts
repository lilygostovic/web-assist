// TODO:: script type might not be correct, just put as placeholder for what is expected
export const injectScript = (script: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Query active tab and inject script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        reject(new Error("No active tab found."));
        return;
      }

      const tabId = tabs[0].id;

      if (tabId === undefined) {
        reject(new Error("No active tab found."));
        return;
      }

      // Execute provided script in the active tab
      chrome.tabs.executeScript({ code: `alert('hi')` }, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[0]);
        }
      });
    });
  });
};
