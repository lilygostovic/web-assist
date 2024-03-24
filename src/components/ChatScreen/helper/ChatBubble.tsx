import { StyledDiv, StyledText } from "../../common";

type ChatBubbleProps = {
  isModel?: boolean;
  content: string;
};

export const ChatBubble = ({ isModel = false, content }: ChatBubbleProps) => (
  <StyledDiv
    display="flex"
    justifyContent={isModel ? "left" : "right"}
    pr={isModel ? "20%" : "0px"}
    pl={isModel ? "0px" : "20%"}
  >
    <StyledDiv
      bg={isModel ? "#E9E9EB" : "#8b25be"}
      display="inline-block"
      borderRadius={16}
      my="2px"
      p="8px"
    >
      <StyledText variant="chatBubble" color={isModel ? "black" : "white"}>
        {content}
      </StyledText>
    </StyledDiv>
  </StyledDiv>
);
