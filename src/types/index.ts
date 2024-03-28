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
type ActionPrevTurn = {
  type: "browser";
  intent: "click" | "textinput" | "submit" | "change" | "load";
};
export type PrevTurn = ChatPrevTurn | ScrollPrevTurn | ActionPrevTurn;
