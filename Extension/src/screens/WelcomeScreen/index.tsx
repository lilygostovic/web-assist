import { ModelNames } from "../../types";
import { StyledDiv, StyledText } from "../../components";

type ModelButtonProps = {
  model: string;
  modelSetter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const ModelButton = ({ model, modelSetter }: ModelButtonProps) => (
  <StyledDiv
    display="flex"
    flexDirection="column"
    alignItems="center"
    width="50%"
    bg="#8933b5"
    borderRadius={8}
    my="6px"
    py="10px"
    onClick={() => {
      modelSetter(model);
    }}
  >
    <StyledText color="white">{model}</StyledText>
  </StyledDiv>
);

type WelcomeScreenProps = {
  modelSetter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const WelcomeScreen = ({ modelSetter }: WelcomeScreenProps) => {
  return (
    <StyledDiv
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <StyledDiv pb="15px">
        <StyledText variant="title">Welcome to WebAssist</StyledText>
      </StyledDiv>
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
        {ModelNames.map((model) => (
          <ModelButton model={model} modelSetter={modelSetter} />
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
