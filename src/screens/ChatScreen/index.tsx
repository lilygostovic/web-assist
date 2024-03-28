import { useState } from "react";

import { StyledDiv } from "../../components";
import { useChromeExtensionService } from "../../services";
import { ChatMessage, ModelName } from "../../types";
import { Header } from "./Header";
import { InputField } from "./InputField";
import { MessageHistory } from "./MessageHistory";

type ChatScreenProps = {
  modelName: ModelName;
  modelSetter: React.Dispatch<React.SetStateAction<ModelName | undefined>>;
};

export const ChatScreen = ({ modelName, modelSetter }: ChatScreenProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [modelIsTyping, setModelIsTyping] = useState(false);
  const [tabId, setTabId] = useState<number | undefined>(undefined);

  const { getCurrentTabId } = useChromeExtensionService();

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
