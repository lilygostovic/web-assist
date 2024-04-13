import { MousePosition } from "../../types";

// TODO: check if we actually use mouse position
// TODO: Currently, doesn't make sense as the mouse is usually interacting with the extension...
export const getMousePosition = (): MousePosition => {
  let result = {
    x: 0,
    y: 0,
  } as MousePosition;

  return result;
};
