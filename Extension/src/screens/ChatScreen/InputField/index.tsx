import { useState } from "react";

import { StyledDiv, ErrorToast, InfoToast } from "../../../components";
import { useModelsService } from "../../../services";
import { ChatMessage, PrevTurn, ResponseBody } from "../../../types";
import { ContinueButton } from "./ContinueButton";
import { handleResponse } from "./handleResponse";
import { useMousePosition } from "./useMousePosition";

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

  const { postChat } = useModelsService();
  const { mousePosition } = useMousePosition();

  const blockSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    ErrorToast({ message: "Model is loading..." });
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    // Perform actions when the button is clicked
    event.preventDefault(); // Prevent the default behavior of the button
    const form = event.currentTarget.form; // Get the form element
    if (form) {
      form.submit(); // Submit the form
    }
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
    try {
      const res = await postChat(
        model,
        sessionID,
        uidKey,
        text,
        prevTurn,
        mousePosition
      );

      // // perform action
      // handleResponse({ res, setHistory });

      // // update prev_turn
      // setPrevTurn(res);
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
      {/* TODO: change button to be invisible if no history, disabled when model is typing */}

      {history.length === 0 ? (
        <></>
      ) : (
        <ContinueButton
          model={model}
          sessionID={sessionID}
          uidKey={uidKey}
          historyExists={history.length !== 0}
          prevTurn={prevTurn}
          mousePosition={mousePosition}
          modelIsTyping={modelIsTyping}
          setModelIsTyping={setModelIsTyping}
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
