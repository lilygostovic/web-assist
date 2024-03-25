// TODO:: script type might not be correct, just put as placeholder for what is expected
export const injectScript = (tabId: number, script: () => {}) => {
  if (tabId === undefined) {
    alert("The tabId is undefined, please try again in a moment.");
    return;
  }

  // Execute the provided js/ts code in the current active tab
  chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      func: script,
    })
    .catch((err: any) => {
      alert(err);
    });
};
