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

  // Element is not interactive
  if (!isInteractiveElement(element)) {
    return false;
  }

  return true;
};

const getElementByUID = (uidKey, uid) => {
  return document.querySelector(`[${uidKey}="${uidValue}"]`);
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
const tagElementsAndRetrieveBBox = async (uidKey) => {
  await waitForDocumentReady();

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

const retrieveHTML = async () => {
  await waitForDocumentReady();
  return document.documentElement.outerHTML;
};

const loadURL = async (url) => {
  await waitForDocumentReady();
  window.location.href = url;
  await waitForDocumentReady();
  return window.location.href === getURL();
};

const _scroll = async (x, y) => {
  await waitForDocumentReady();
  window.scrollTo(x, y);
  return window.scrollX === x && window.scrollY === y;
};

const _click = async (uidKey, uid) => {
  await waitForDocumentReady();
  let element = getElementByUID(uidKey, uid);

  element_clickable = ensureElement(element);
  if (element_clickable) {
    element.click();
  }

  return element_clickable;
};

const _submit = async (uidKey, uid) => {
  await waitForDocumentReady();
  let element = getElementByUID(uidKey, uid);

  element_submittable = ensureElement(element);

  if (element_submittable) {
    element.submit();
  }
  return element_submittable;
};

const _change = async (uidKey, uid, value) => {
  await waitForDocumentReady();
  let element = getElementByUID(uidKey, uid);

  element_changeable = ensureElement(element);

  if (element_changeable) {
    element.value = value;
  }
  return element_changeable;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let done_async_action = false;

  // Check if the message is to execute a script
  if (message.action === "tagElementsAndRetrieveBBox") {
    sendResponse(tagElementsAndRetrieveBBox(message.uid));
    done_async_action = true;
  }

  if (message.action === "retrieveHTML") {
    sendResponse(retrieveHTML());
    done_async_action = true;
  }

  if (message.action === "change") {
    sendResponse(_change(message.uidKey, message.uid, message.value));
    done_async_action = true;
  }

  if (message.action === "click") {
    sendResponse(_click(message.uidKey, message.uid));
    done_async_action = true;
  }

  if (message.action === "load") {
    sendResponse(loadURL(message.uid));
    done_async_action = true;
  }

  if (message.action === "scroll") {
    sendResponse(_scroll(message.scrollX, message.scrollY));
    done_async_action = true;
  }

  if (message.action === "submit") {
    sendResponse(_submit(message.uidKey, message.uid));
    done_async_action = true;
  }

  if (message.action === "textinput") {
    sendResponse(_change(message.uidKey, message.uid, message.text));
    done_async_action = true;
  }

  return done_async_action;
});
