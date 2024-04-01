export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};

export type ModelName = "GPT-3.5" | "GPT-4";
export const modelNames: ModelName[] = ["GPT-3.5", "GPT-4"];

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
  attributes: object; // TODO:: can we add better typing?
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
type TransitionQualifier =
  | "client_redirect"
  | "server_redirect"
  | "forward_back"
  | "from_address_bar";

type TransitionType =
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
type Properties = {
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
