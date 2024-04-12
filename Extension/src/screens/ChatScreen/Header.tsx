import { ModelName } from "../../types";
import { StyledDiv, StyledText } from "../../components";

type HeaderProps = {
  model: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

export const Header = ({ model, modelSetter }: HeaderProps) => (
  <>
    <StyledDiv
      height="5vh"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      mb="4px"
      position="sticky" // Make the header sticky
      top="0" // Stick it to the top of the viewport
      zIndex="999" // Ensure it's above other content
    >
      <StyledDiv onClick={() => modelSetter(undefined)}>
        <StyledText variant="homeButton">Home</StyledText>
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
