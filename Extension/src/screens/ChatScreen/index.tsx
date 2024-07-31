import { useState } from "react";

import { StyledDiv } from "../../components";
import { ChatMessage, PrevTurn } from "../../types";
import { EmptyMessage } from "./EmptyMessage";
import { Header } from "./Header";
import { InputField } from "./InputField";
import { generateSessionID } from "./InputField/helper";
import { MessageHistory } from "./MessageHistory";

type ChatScreenProps = {
  model: string;
  modelSetter: React.Dispatch<React.SetStateAction<string>>;
};

export const ChatScreen = ({ model, modelSetter }: ChatScreenProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [modelIsTyping, setModelIsTyping] = useState(false);
  const [sessionID, setSessionID] = useState(generateSessionID()); // Initialize sessionID once
  const uidKey = "data-webtasks-id";
  const [prevTurn, setPrevTurn] = useState<null | PrevTurn>(null);

  return (
    <StyledDiv height="95%" width="95%">
      <Header
        model={model}
        modelSetter={modelSetter}
        sessionID={sessionID}
        sessionSetter={setSessionID}
        historySetter={setHistory}
        prevTurnSetter={setPrevTurn}
      />
      <StyledDiv
        width="100%"
        height="85%"
        display="flex"
        flexDirection="column"
      >
        {/* TODO: MessageHistory will need to keep track of model actions. */}
        {history.length === 0 ? (
          <EmptyMessage />
        ) : (
          <MessageHistory history={history} modelIsTyping={modelIsTyping} />
        )}
        <InputField
          model={model}
          sessionID={sessionID}
          uidKey={uidKey}
          history={history}
          modelIsTyping={modelIsTyping}
          prevTurn={prevTurn}
          setModelIsTyping={setModelIsTyping}
          setHistory={setHistory}
          setPrevTurn={setPrevTurn}
        />
      </StyledDiv>
    </StyledDiv>
  );
};
