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

chrome.commands.onCommand.addListener(function (command) {
  if (command === "reload_extension") {
    chrome.runtime.reload();
  }
});

export {};
