import {
  useEffect,
  useRef,
} from 'react';

import { ChatMessage } from '../../types';
import { StyledDiv } from '../common';
import { ChatBubble } from './ChatBubble';

type MessageHistoryProps = {
  history: ChatMessage[];
};

export const MessageHistory = ({ history }: MessageHistoryProps) => {
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
          isUser={chatMessage.speaker === "model"}
        />
      ))}
    </StyledDiv>
  );
};
