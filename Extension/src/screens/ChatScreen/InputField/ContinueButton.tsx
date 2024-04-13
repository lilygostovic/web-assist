import { styled } from "styled-components";

import { StyledDiv, StyledText, ErrorToast } from "../../../components";
import { ChatMessage, PrevTurn } from "../../../types";
import { useModelsService } from "../../../services";

const StyledButtonDiv = styled.div`
  padding: 6px;
  cursor: default;
  &:hover {
    cursor: pointer;
  }
`;

type ContinueButtonProps = {
  model: string;
  sessionID: string;
  uidKey: string;
  historyExists: boolean;
  prevTurn: PrevTurn | null;
  modelIsTyping: boolean;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setPrevTurn: React.Dispatch<React.SetStateAction<null | PrevTurn>>;
};

export const ContinueButton = ({
  model,
  sessionID,
  uidKey,
  historyExists,
  prevTurn,
  modelIsTyping,
  setModelIsTyping,
  setHistory,
  setPrevTurn,
}: ContinueButtonProps) => {
  const { continueExecution, performAction } = useModelsService();

  const blockContinue = () => {
    ErrorToast({ message: "Model is loading..." });
  };

  const handleClick = async () => {
    setModelIsTyping(true);

    // TODO: change postChat to also handleResponse and setPrevTurn
    try {
      const res = await continueExecution(model, sessionID, uidKey, prevTurn);
      performAction(res, uidKey, setHistory, setPrevTurn);
    } catch (err) {
      ErrorToast({ message: `Error: ${err}` });
    }

    setModelIsTyping(false);
  };

  return (
    <StyledDiv display="flex" justifyContent="center" mt="10px">
      <StyledButtonDiv onClick={modelIsTyping ? blockContinue : handleClick}>
        <StyledText
          variant={modelIsTyping ? "disabledContinueButton" : "continueButton"}
        >
          continue...
        </StyledText>
      </StyledButtonDiv>
    </StyledDiv>
  );
};
