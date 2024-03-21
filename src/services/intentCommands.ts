export const scroll = (pixelsToScroll: number): void => {
  window.scrollBy({
    top: pixelsToScroll,
    left: 0,
    behavior: "smooth",
  });
};

export const load = (url: string) => {
  window.open(url, "_blank");
};
