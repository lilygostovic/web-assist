import { styled } from "styled-components";

import { StyledDiv, StyledText } from "../../../components";
import { ModelName, MousePosition, PrevTurn } from "../../../types";
import { useModelsService } from "../../../services";

const StyledButtonDiv = styled.div`
  padding: 6px;
  cursor: default;
  &:hover {
    cursor: pointer;
  }
`;

type ContinueButtonProps = {
  model: ModelName;
  sessionID: string;
  uidKey: string;
  historyExists: boolean;
  prevTurn: PrevTurn | null;
  mousePosition: MousePosition;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ContinueButton = ({
  model,
  sessionID,
  uidKey,
  historyExists,
  prevTurn,
  mousePosition,
  setModelIsTyping,
}: ContinueButtonProps) => {
  const { continueExecution } = useModelsService();

  const handleClick = async () => {
    setModelIsTyping(true);

    await continueExecution(model, sessionID, uidKey, prevTurn, mousePosition);

    setModelIsTyping(false);
  };

  return (
    <StyledDiv display="flex" justifyContent="center" mt="10px">
      <StyledButtonDiv onClick={historyExists ? handleClick : () => {}}>
        <StyledText
          variant={historyExists ? "continueButton" : "disabledContinueButton"}
        >
          continue...
        </StyledText>
      </StyledButtonDiv>
    </StyledDiv>
  );
};
