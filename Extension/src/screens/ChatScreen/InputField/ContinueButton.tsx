import { styled } from "styled-components";

import { StyledDiv, StyledText } from "../../../components";
import { useModelsService } from "../../../services";

const StyledButtonDiv = styled.div`
  padding: 6px;
  cursor: default;
  &:hover {
    cursor: pointer;
  }
`;

type ContinueButtonProps = {
  historyExists: boolean;
  setModelIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ContinueButton = ({
  historyExists,
  setModelIsTyping,
}: ContinueButtonProps) => {
  const { continueExecution } = useModelsService();

  const handleClick = async () => {
    setModelIsTyping(true);

    await continueExecution();

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
