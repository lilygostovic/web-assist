import { useState } from "react";

import { getCurrentTabId } from "../../services";
import { ChatMessage, ModelName } from "../../types";
import { StyledDiv } from "../common";
import { Header, InputField, MessageHistory } from "./helper";

type ChatScreenProps = {
  modelName: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

export const ChatScreen = ({ modelName, modelSetter }: ChatScreenProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [modelIsTyping, setModelIsTyping] = useState(false);
  const [tabId, setTabId] = useState<number | undefined>(undefined);

  getCurrentTabId()
    .then((tabId) => {
      setTabId(tabId);
    })
    .catch(() => {
      alert("Error finding tabId.");
    });

  return (
    <StyledDiv height="100%" width="100%">
      <Header modelName={modelName} modelSetter={modelSetter} />
      <StyledDiv
        height="90%"
        width="100%"
        display="flex"
        flexDirection="column"
      >
        <MessageHistory history={history} modelIsTyping={modelIsTyping} />
        <InputField
          modelName={modelName}
          history={history}
          modelIsTyping={modelIsTyping}
          setModelIsTyping={setModelIsTyping}
          setHistory={setHistory}
        />
      </StyledDiv>
    </StyledDiv>
  );
};
