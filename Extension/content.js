const generateUID = () => {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

const getElementByXpath = (xpath) => {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const isInteractiveElement = (element) => {
  return (
    element.tagName === "BUTTON" ||
    element.tagName === "A" ||
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA"
  );
};

const ensureElement = (element) => {
  // Did not find element
  if (!element) {
    return false;
  }

  // Element not visible
  const isVisible = !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
  if (!isVisible) {
    return false;
  }

  // Element is disabled
  if (element.disabled) {
    return false;
  }

  return true;
};

const getElementByUID = (uidKey, uid) => {
  const element = document.querySelector(`[${uidKey}="${uid}"]`);

  element.style.border = "2px solid red";
  element.style.backgroundColor = "yellow";

  return element;
};

const getElementInfo = (element) => {
  const attributes = {};
  for (const attr of element.attributes) {
    attributes[attr.name] = attr.value;
  }

  // Get bounding box information
  const bbox = element.getBoundingClientRect();

  // Get tag name
  const tagName = element.tagName;

  // Get text content
  const textContent = element.textContent.trim();

  // Create and return Element object
  return {
    attributes: attributes,
    bbox: {
      bottom: bbox.bottom,
      height: bbox.height,
      left: bbox.left,
      right: bbox.right,
      top: bbox.top,
      width: bbox.width,
      x: bbox.x,
      y: bbox.y,
    },
    tagName: tagName,
    xpath: "",
    textContent: textContent,
  };
};

// Browser Helper Functions
const waitForDocumentReady = () => {
  return new Promise((resolve) => {
    const checkReadyState = () => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        setTimeout(checkReadyState, 10);
      }
    };
    checkReadyState();
  });
};

// Actual Functions to call
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

const retrieveHTML = () => {
  return document.documentElement.outerHTML;
};

const loadURL = (url) => {
  window.location.href = url;
  return window.location.href === url;
};

const _scroll = (x, y) => {
  window.scrollTo(x, y);
  return window.scrollX === x && window.scrollY === y;
};

const _click = (uidKey, uid) => {
  let element = getElementByUID(uidKey, uid);

  element_clickable = ensureElement(element);
  if (element_clickable) {
    element.click();
    return getElementInfo(element);
  }

  return element_clickable;
};

const _submit = (uidKey, uid) => {
  let element = getElementByUID(uidKey, uid);

  element_submittable = ensureElement(element);

  if (element_submittable) {
    element.submit();
    return getElementInfo(element);
  }
  return element_submittable;
};

const _change = (uidKey, uid, value) => {
  let element = getElementByUID(uidKey, uid);

  element_changeable = ensureElement(element);

  if (element_changeable) {
    element.value = value;
    return getElementInfo(element);
  }
  return element_changeable;
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  await waitForDocumentReady();

  // Check if the message is to execute a script
  if (message.action === "tagElementsAndRetrieveBBox") {
    sendResponse(tagElementsAndRetrieveBBox(message.uid));
  }

  if (message.action === "retrieveHTML") {
    sendResponse(retrieveHTML());
  }

  if (message.intent === "change") {
    sendResponse(_change(message.uidKey, message.uid, message.value));
  }

  if (message.intent === "click") {
    sendResponse(_click(message.uidKey, message.uid));
  }

  if (message.intent === "load") {
    sendResponse(loadURL(message.url));
  }

  if (message.intent === "scroll") {
    sendResponse(_scroll(message.scrollX, message.scrollY));
  }

  if (message.intent === "submit") {
    sendResponse(_submit(message.uidKey, message.uid));
  }

  if (message.intent === "textinput") {
    sendResponse(_change(message.uidKey, message.uid, message.text));
  }

  await waitForDocumentReady();
});
