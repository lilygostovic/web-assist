import { useState } from "react";

import { callModel } from "../../../services/modelsService";
import { ChatMessage, ModelName } from "../../../types";
import { StyledDiv } from "../../common";

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

  const blockSubmit = () => {
    // TODO:: improve this error handling
    alert("Model is loading...");
    return false;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setHistory([...history, { content: text, speaker: "user" }]);
    setText("");

    setModelIsTyping(true);
    await callModel(modelName, text, history).then(async (newHistory) => {
      for (let msg of newHistory) {
        // Wait for 0.5 seconds to seem more natural
        await new Promise((resolve) => setTimeout(resolve, 500));

        setHistory((prevHistory) => [...prevHistory, msg]);
      }
    });
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
