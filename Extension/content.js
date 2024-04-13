const generateUID = () => {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

const tagElementsAndRetrieveBBox = (uidKey) => {
  // get all elements
  const elements = document.querySelectorAll("*");
  let boundingBoxes = {};

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message is to execute a script
  if (message.action === "tagElementsAndRetrieveBBox") {
    sendResponse(tagElementsAndRetrieveBBox(message.uid));
  }

  if (message.action === "retrieveHTML") {
    sendResponse(document.documentElement.outerHTML);
  }
});
