export const getCurrentTabId = (): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs.length > 0) {
        const currentTabId: number = tabs[0].id!;
        resolve(currentTabId);
      } else {
        reject(new Error("No active tab found."));
      }
    });
  });
};
