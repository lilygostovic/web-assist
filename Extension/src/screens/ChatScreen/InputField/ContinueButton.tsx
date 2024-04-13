import { styled } from "styled-components";

import { StyledDiv, StyledText, ErrorToast } from "../../../components";
import { MousePosition, PrevTurn } from "../../../types";
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
  mousePosition: MousePosition;
  modelIsTyping: boolean;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ContinueButton = ({
  model,
  sessionID,
  uidKey,
  historyExists,
  prevTurn,
  mousePosition,
  modelIsTyping,
  setModelIsTyping,
}: ContinueButtonProps) => {
  const { continueExecution } = useModelsService();

  const blockContinue = () => {
    ErrorToast({ message: "Model is loading..." });
  };

  const handleClick = async () => {
    setModelIsTyping(true);

    // TODO: change postChat to also handleResponse and setPrevTurn
    // TODO: move mousePosition within continueExecution
    await continueExecution(model, sessionID, uidKey, prevTurn, mousePosition);

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
