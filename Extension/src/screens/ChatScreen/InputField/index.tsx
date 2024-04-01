import { useState } from "react";

import { StyledDiv } from "../../../components";
import { useModelsService } from "../../../services";
import { ChatMessage, ModelName, PrevTurn } from "../../../types";
import { handleResponse } from "./handleResponse";
import { useMousePosition } from "./useMousePosition";

type InputFieldProps = {
  modelName: ModelName;
  history: ChatMessage[];
  modelIsTyping: boolean;
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
};

export const InputField = ({
  modelName,
  history,
  modelIsTyping,
  setHistory,
  setModelIsTyping,
}: InputFieldProps) => {
  const [text, setText] = useState("");
  const [prevTurn, setPrevTurn] = useState<null | PrevTurn>(null);

  const { postChat } = useModelsService();
  const { mousePosition } = useMousePosition();

  const blockSubmit = () => {
    // TODO:: improve this error handling, currently it erases the whole chathistory if this runs
    alert("Model is loading...");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent submission with empty textbox
    e.preventDefault();

    // Update chat to include user's message
    setHistory([...history, { content: text, speaker: "user" }]);
    setText("");

    // Enable loading state
    setModelIsTyping(true);

    // Await response from backend
    const res = await postChat(modelName, text, prevTurn, mousePosition);

    // Update previous turn
    setPrevTurn(res);

    handleResponse({ res, setHistory });

    // Disable loading state
    setModelIsTyping(false);
  };

  return (
    <StyledDiv display="flex" flexDirection="row" mt="10px">
      <StyledDiv flex={1}>
        <form onSubmit={modelIsTyping ? blockSubmit : handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setText(e.target.value);
            }}
            required
            style={{ width: "95%" }}
          />
        </form>
      </StyledDiv>
      <button>send</button>
    </StyledDiv>
  );
};
