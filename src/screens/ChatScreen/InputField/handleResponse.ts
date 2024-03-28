import { ChatMessage, PrevTurn } from "../../../types";

type HandleResponseProps = {
  res: PrevTurn;
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

export const handleResponse = ({ res, setHistory }: HandleResponseProps) => {
  if (res.intent === "say") {
    setHistory((prevHistory) => [
      ...prevHistory,
      { speaker: "model", content: res.utterance },
    ]);
  } else if (res.intent === "scroll") {
    // handle scroll actions
  } else {
    // handle all other actions
  }
};
