export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};

export type ModelName = "Sheared LLaMa";
export const modelNames: ModelName[] = ["Sheared LLaMa"];

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
type ChatPrevTurn = {
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

type ChangeBody = {
  intent: "change";
  args: {
    uid: string;
  };
  element: string;
};
type ClickBody = {
  intent: "click";
  args: {
    uid: string;
  };
  element: string;
};
type LoadBody = {
  intent: "load";
  args: {
    url: string;
  };
  element: null;
};
type SayBody = {
  intent: "say";
  args: {
    utterance: string;
  };
  element: null;
};
type ScrollBody = {
  intent: "scroll";
  args: {
    x: number;
    y: number;
  };
  element: null;
};
type SubmitBody = {
  intent: "submit";
  args: {
    uid: string;
  };
  element: string;
};
type TextInputBody = {
  intent: "submit";
  args: {
    uid: string;
    text: string;
  };
  element: string;
};
type ErrorBody = {
  error: string;
  message: string;
};

export type GetNextActionResponse = {
  status: 200 | 400 | 404 | 500; // Note: in API docs called http_code
  // content_type: "application/json";
  body:
    | ChangeBody
    | ClickBody
    | LoadBody
    | SayBody
    | ScrollBody
    | SubmitBody
    | TextInputBody
    | ErrorBody;
};
