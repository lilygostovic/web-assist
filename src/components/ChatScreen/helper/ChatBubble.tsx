import { StyledDiv, StyledText } from "../../common";

type ChatBubbleProps = {
  isUser?: boolean;
  content: string;
};

export const ChatBubble = ({ isUser = false, content }: ChatBubbleProps) => (
  <StyledDiv
    display="flex"
    justifyContent={isUser ? "left" : "right"}
    pr={isUser ? "20%" : "0px"}
    pl={isUser ? "0px" : "20%"}
  >
    <StyledDiv
      bg={isUser ? "#E9E9EB" : "#8b25be"}
      display="inline-block"
      borderRadius={16}
      my="2px"
      p="8px"
    >
      <StyledText variant="chatBubble" color={isUser ? "black" : "white"}>
        {content}
      </StyledText>
    </StyledDiv>
  </StyledDiv>
);
