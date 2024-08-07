export type ChatMessage = {
  content: string;
  speaker: "user" | "model" | "action";
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

export type Element_ = {
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
export type ScrollPrevTurn = {
  intent: "scroll";
  scrollX: number | undefined;
  scrollY: number | undefined;
};
export type LoadPrevTurn = {
  intent: "load";
  url?: string;
  properties?: Properties;
};
export type PrevTurnWithElement = {
  intent: "change" | "click" | "submit" | "textinput";
  element: Element_;
};
export type PrevTurn =
  | ChatPrevTurn
  | ScrollPrevTurn
  | LoadPrevTurn
  | PrevTurnWithElement;

export type ResponseBody = {
  intent: string;
  args: { [key: string]: any };
  element: any;
};

export type ErrorBody = {
  message: string;
};
