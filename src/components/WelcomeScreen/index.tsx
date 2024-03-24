import { ModelName, modelNames } from "../../types";
import { StyledDiv, StyledText } from "../common";

type ModelButtonProps = {
  modelName: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

const ModelButton = ({ modelName, modelSetter }: ModelButtonProps) => (
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
      modelSetter(modelName);
    }}
  >
    <StyledText color="white">{modelName}</StyledText>
  </StyledDiv>
);

type WelcomeScreenProps = {
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
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
        {modelNames.map((modelName) => (
          <ModelButton modelName={modelName} modelSetter={modelSetter} />
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
