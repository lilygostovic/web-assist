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
      width="300px"
      height="400px"
      overflow="auto"
      flex={1}
    >
      {history.map((chatMessage, index) => (
        <ChatBubble
          key={index}
          content={chatMessage.content}
          isModel={chatMessage.speaker === "model"}
        />
      ))}

      {modelIsTyping && <ChatBubble isLoading />}
    </StyledDiv>
  );
};
