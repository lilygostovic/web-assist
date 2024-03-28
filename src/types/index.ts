export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};

export type ModelName = "GPT-3.5" | "GPT-4";
export const modelNames: ModelName[] = ["GPT-3.5", "GPT-4"];

export type BrowserInfo = {
  viewportSize: {
    height: number;
    width: number;
  };
  rawHTML: string;
};

// Previous Turn
type ChatPrevTurn = {
  type: "chat";
  intent: "say";
  utterance: string;
};
type ScrollPrevTurn = {
  type: "browser";
  intent: "scroll";
  scrollX: number | undefined;
  scrollY: number | undefined;
};
type LoadPrevTurn = {
  type: "browser";
  intent: "load";
};
type PrevTurnWithElement = {
  type: "browser";
  intent: "click" | "textinput" | "submit" | "change";
  element: {
    attributes: object;
    bbox: {
      bottom: number;
      height: number;
      left: number;
      right: number;
      top: number;
      width: number;
      x: number;
      y: number;
    };
    tagName: string;
    xpath: string;
    textContent: string;
  };
};
export type PrevTurn =
  | ChatPrevTurn
  | ScrollPrevTurn
  | LoadPrevTurn
  | PrevTurnWithElement;
