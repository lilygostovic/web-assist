import { useState } from "react";

import { StyledDiv, ErrorToast, InfoToast } from "../../../components";
import { useModelsService } from "../../../services";
import { ChatMessage, PrevTurn } from "../../../types";
import { ContinueButton } from "./ContinueButton";

type InputFieldProps = {
  model: string;
  sessionID: string;
  uidKey: string;
  history: ChatMessage[];
  modelIsTyping: boolean;
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
};

export const InputField = ({
  model,
  sessionID,
  uidKey,
  history,
  modelIsTyping,
  setHistory,
  setModelIsTyping,
}: InputFieldProps) => {
  const [text, setText] = useState("");
  const [prevTurn, setPrevTurn] = useState<null | PrevTurn>(null);

  const { postChat, performAction } = useModelsService();

  const blockSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    ErrorToast({ message: "Model is loading..." });
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    // Prevent submission with empty textbox
    e?.preventDefault();

    // If still empty text, we just do nothing.
    if (text === "") {
      return;
    }

    // Update chat history, empty text field.
    setHistory([{ content: text, speaker: "user" }, ...history]);
    setText("");

    // Model to load
    setModelIsTyping(true);

    // try to get response from backend
    // TODO: change postChat to also handleResponse and setPrevTurn
    try {
      const res = await postChat(model, sessionID, uidKey, text, prevTurn);
      performAction(res, uidKey, setHistory, setPrevTurn);
    } catch (err) {
      ErrorToast({ message: `Error: ${err}` });
    }

    // Disable loading state
    setModelIsTyping(false);
  };

  return (
    <StyledDiv
      display="flex"
      flexDirection="column"
      position="fixed"
      bottom="0"
      width="95%"
      mb="15px"
    >
      {history.length === 0 ? (
        <></>
      ) : (
        <ContinueButton
          model={model}
          sessionID={sessionID}
          uidKey={uidKey}
          historyExists={history.length !== 0}
          prevTurn={prevTurn}
          modelIsTyping={modelIsTyping}
          setModelIsTyping={setModelIsTyping}
          setHistory={setHistory}
          setPrevTurn={setPrevTurn}
        />
      )}

      <StyledDiv display="flex" flexDirection="column" mt="10px" width="100%">
        <form
          onSubmit={modelIsTyping ? blockSubmit : handleSubmit}
          style={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          <input
            type="text"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setText(e.target.value);
            }}
            required
            placeholder={text ? "" : "Message Web Assist..."}
            style={{ width: "95%" }}
          />

          <button
            type="submit"
            disabled={modelIsTyping}
            style={{
              // Customize select element style
              border: "none",
              background: "transparent",
              color: modelIsTyping ? "#c3c3c3" : "#a15dc4",
              textAlign: "center",
              cursor: modelIsTyping ? "not-allowed" : "pointer",
            }}
          >
            send
          </button>
        </form>
      </StyledDiv>
    </StyledDiv>
  );
};
