import { StyledDiv, StyledText } from "../common";

const modelNames = ["GPT-3.5", "GPT-4"];

type ModelButtonProps = {
  modelName: string;
};

const ModelButton = ({ modelName }: ModelButtonProps) => (
  <StyledDiv
    display="flex"
    flexDirection="column"
    alignItems="center"
    width="50%"
    bg="#8933b5"
    borderRadius={8}
    my="6px"
    py="10px"
  >
    <StyledText color="white">{modelName}</StyledText>
  </StyledDiv>
);

export const WelcomeScreen = () => {
  return (
    <StyledDiv
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <StyledText variant="title">Welcome to WebAssist</StyledText>
      <StyledText variant="subtitle">
        To continue, please select a model to use.
      </StyledText>
      <StyledDiv
        display="flex"
        flexDirection="column"
        width="100%"
        alignItems="center"
        my="45px"
      >
        {modelNames.map((modelName) => (
          <ModelButton modelName={modelName} />
        ))}
      </StyledDiv>
      <StyledText variant="welcomeText">
        WebAssist is an innovative browser extension designed to enable users to
        converse with Large Language Models towards accomplishing real-world
        tasks within web browsers.
      </StyledText>
    </StyledDiv>
  );
};
