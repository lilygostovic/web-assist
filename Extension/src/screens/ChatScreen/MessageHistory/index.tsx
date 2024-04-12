import { useEffect, useRef } from "react";

import { StyledDiv } from "../../../components";
import { ChatMessage } from "../../../types";
import { ChatBubble } from "./ChatBubble";

type MessageHistoryProps = {
  history: ChatMessage[];
  modelIsTyping: boolean;
};

export const MessageHistory = ({
  history,
  modelIsTyping,
}: MessageHistoryProps) => {
  const messageHistoryRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messageHistoryRef.current) {
      messageHistoryRef.current.scrollTop =
        messageHistoryRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <StyledDiv
      ref={messageHistoryRef}
      width="100%"
      height="100%"
      style={{ overflowY: "auto" }}
      display="flex"
      flex="1"
      flexDirection="column-reverse"
    >
      {modelIsTyping && <ChatBubble isLoading />}

      {history.map((chatMessage, index) => (
        <ChatBubble
          key={index}
          content={chatMessage.content}
          isModel={chatMessage.speaker === "model"}
        />
      ))}
    </StyledDiv>
  );
};
