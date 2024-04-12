import { useRef, useState } from "react";

import { StyledDiv, StyledText } from "../../components";
import { ChatMessage, ModelName } from "../../types";
import { Header } from "./Header";
import { InputField } from "./InputField";
import { MessageHistory } from "./MessageHistory";
import { generateSessionID } from "./InputField/helper";

type ChatScreenProps = {
  model: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

export const ChatScreen = ({ model, modelSetter }: ChatScreenProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [modelIsTyping, setModelIsTyping] = useState(false);
  const [sessionID, setSessionID] = useState(generateSessionID()); // Initialize sessionID once
  const uidKey = "web-assist-id";

  return (
    <StyledDiv height="100%" width="100%">
      <Header model={model} modelSetter={modelSetter} />
      <StyledDiv display="flex" width="100%" justifyContent="center">
        <StyledText variant="subtitle">Session {sessionID}</StyledText>
      </StyledDiv>
      <StyledDiv
        width="100%"
        height="85%"
        display="flex"
        flexDirection="column"
      >
        <MessageHistory history={history} modelIsTyping={modelIsTyping} />
        <InputField
          model={model}
          sessionID={sessionID}
          uidKey={uidKey}
          history={history}
          modelIsTyping={modelIsTyping}
          setModelIsTyping={setModelIsTyping}
          setHistory={setHistory}
        />
      </StyledDiv>
    </StyledDiv>
  );
};
