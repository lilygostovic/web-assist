import { ModelName } from "../../types";
import { StyledDiv, StyledText } from "../../components";

type HeaderProps = {
  model: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

export const Header = ({ model, modelSetter }: HeaderProps) => (
  <>
    <StyledDiv
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      mb="4px"
    >
      <StyledDiv onClick={() => modelSetter(undefined)} position="fixed">
        <StyledText variant="backButton">Back</StyledText>
      </StyledDiv>
      <StyledDiv display="flex" width="100%" justifyContent="center">
        <StyledText variant="title">Web Assist</StyledText>
      </StyledDiv>
    </StyledDiv>
    <StyledDiv display="flex" width="100%" justifyContent="center">
      <StyledText variant="subtitle">{model}</StyledText>
    </StyledDiv>
  </>
);
