// Interface for bounding client rect
interface BoundingClientRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Function to generate a unique identifier
const generateUID = (
  elementMap: { [key: string]: any },
  numElements: number
): string => {
  let uid: string;
  do {
    uid = "_" + Math.random().toString(36).substr(2, 20);
  } while (elementMap.hasOwnProperty(uid));
  return uid;
};

// Function to get bounding client rect for an element
const getElementBoundingClientRect = async (
  element: HTMLElement
): Promise<BoundingClientRect> => {
  return new Promise<BoundingClientRect>((resolve, reject) => {
    try {
      const { x, y, width, height, top, right, bottom, left } =
        element.getBoundingClientRect();
      resolve({
        x,
        y,
        width,
        height,
        top,
        right,
        bottom,
        left,
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const processHTML = async (
  uidKey: string,
  rawHTML: string
): Promise<{
  html: string;
  elementMap: { [key: string]: BoundingClientRect };
}> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, "text/html");

  const elements = doc.querySelectorAll<HTMLElement>("*");
  const elementMap: { [key: string]: BoundingClientRect } = {};

  const observeDOM = () => {
    return new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        const allElementsAdded = Array.from(elements).every((element) =>
          document.body.contains(element)
        );
        if (allElementsAdded) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      resolve();
    });
  };

  await observeDOM();

  await Promise.all(
    Array.from(elements).map(async (element, index) => {
      const uid = generateUID(elementMap, elements.length);
      element.setAttribute(uidKey, uid);
      // alert(doc.documentElement.outerHTML);
      const rect = element.getBoundingClientRect();
      elementMap[uid] = rect;
      // alert(rect.bottom + rect.height + rect.left + rect.right);
    })
  );

  const html = doc.documentElement.outerHTML;

  return { html, elementMap };
};
