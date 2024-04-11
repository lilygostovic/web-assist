chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: "js/index.html",
    type: "panel",
    width: 300,
    height: 600,
  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

export {};
