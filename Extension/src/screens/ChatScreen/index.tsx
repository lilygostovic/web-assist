import { useRef, useState } from "react";

import { StyledDiv } from "../../components";
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

  const sessionID = generateSessionID();
  const uidKey = "web-assist-id";

  return (
    <StyledDiv height="100%" width="100%">
      <Header model={model} modelSetter={modelSetter} />
      <StyledDiv
        height="90%"
        width="100%"
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
