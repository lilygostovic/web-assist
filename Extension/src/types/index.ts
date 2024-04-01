// TODO:: put types only used locally back in those files

export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};

export type ModelName = "GPT-3.5" | "GPT-4";
export const modelNames: ModelName[] = ["GPT-3.5", "GPT-4"];

export type ElementInfo = {
  tagName: string;
  boundingClientRect: DOMRectReadOnly;
};
export type BrowserInfo = {
  viewportSize: {
    height: number;
    width: number;
  };
  rawHTML: string;
  elementsInfo: ElementInfo[];
};

// Previous Turn
type MetaData = {
  mouseX: number;
  mouseY: number;
  tabId: number;
  url: string;
  viewportHeight: number;
  viewportWidth: number;
  zoomLevel: number;
};
type Element = {
  attributes: object; // TODO:: can we add better typing?s
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
export type Properties = {
  transitionQualifiers: undefined | TransitionQualifier[];
  transitionType: undefined | TransitionType;
};
type ChatPrevTurn = {
  intent: "say";
  utterance: string;
  html?: string;
  metadata?: MetaData;
};
type ScrollPrevTurn = {
  intent: "scroll";
  html: string;
  metadata: MetaData;
  scrollX: number | undefined;
  scrollY: number | undefined;
};
type LoadPrevTurn = {
  intent: "load";
  html: string;
  metadata: MetaData;
  properties?: Properties;
};
type PrevTurnWithElement = {
  intent: "change" | "click" | "submit" | "textinput";
  html: string;
  metadata: MetaData;
  element: Element;
};
export type PrevTurn =
  | ChatPrevTurn
  | ScrollPrevTurn
  | LoadPrevTurn
  | PrevTurnWithElement;

export type TransitionQualifier =
  | "client_redirect"
  | "server_redirect"
  | "forward_back"
  | "from_address_bar";

export type TransitionType =
  | "link"
  | "typed"
  | "auto_bookmark"
  | "auto_subframe"
  | "manual_subframe"
  | "generated"
  | "start_page"
  | "form_submit"
  | "reload"
  | "keyword"
  | "keyword_generated";
