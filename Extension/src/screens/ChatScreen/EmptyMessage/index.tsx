import { StyledDiv, StyledText } from "../../../components";

export const EmptyMessage = () => {
  return (
    <StyledDiv
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center" // Center vertically
      alignItems="center" // Center horizontally
    >
      <StyledText variant="welcomeText">
        WebAssist is an innovative browser extension designed to enable users to
        converse with Large Language Models towards accomplishing real-world
        tasks within web browsers.
      </StyledText>
    </StyledDiv>
  );
};
