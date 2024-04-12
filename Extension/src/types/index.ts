export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};
export const ModelNames: string[] = ["Sheared LLaMa"];

export type Intent =
  | "change"
  | "click"
  | "submit"
  | "textinput"
  | "load"
  | "scroll"
  | "say";

export type MousePosition = {
  x: number;
  y: number;
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
export type ChatPrevTurn = {
  intent: "say";
  utterance: string;
};
type ScrollPrevTurn = {
  intent: "scroll";
  scrollX: number | undefined;
  scrollY: number | undefined;
};
type LoadPrevTurn = {
  intent: "load";
  properties?: Properties;
};
type PrevTurnWithElement = {
  intent: "change" | "click" | "submit" | "textinput";
  element: Element;
};
export type PrevTurn =
  | ChatPrevTurn
  | ScrollPrevTurn
  | LoadPrevTurn
  | PrevTurnWithElement;

export type ResponseBody = {
  intent: string;
  args: { [key: string]: any };
  element: null | string;
};

export type ErrorBody = {
  message: string;
};
