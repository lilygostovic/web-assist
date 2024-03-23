import { useState } from "react";

import { ChatMessage } from "../../../types";
import { StyledDiv } from "../../common";

type InputFieldProps = {
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

export const InputField = ({ history, setHistory }: InputFieldProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMessage: ChatMessage = {
      content: text,
      speaker: "user",
    };

    setHistory([...history, newMessage]);
    setText("");
  };

  return (
    <StyledDiv display="flex" flexDirection="row" mt="10px">
      <StyledDiv flex={1}>
        <form onSubmit={handleSubmit}>
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
