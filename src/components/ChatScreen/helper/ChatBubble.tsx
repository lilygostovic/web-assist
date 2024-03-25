import { StyledDiv, StyledText } from "../../common";
import { LoadingView } from "./LoadingView";

type ChatBubbleProps = {
  content?: string;
  isModel?: boolean;
  isLoading?: boolean;
};

export const ChatBubble = ({
  content,
  isModel = false,
  isLoading = false,
}: ChatBubbleProps) => (
  <StyledDiv
    display="flex"
    justifyContent={isModel || isLoading ? "left" : "right"}
    pr={isModel || isLoading ? "20%" : "0px"}
    pl={isModel || isLoading ? "0px" : "20%"}
  >
    <StyledDiv
      bg={isModel || isLoading ? "#E9E9EB" : "#8b25be"}
      display="inline-block"
      borderRadius={16}
      my="2px"
      p="8px"
    >
      {isLoading ? (
        <LoadingView />
      ) : (
        <StyledText variant="chatBubble" color={isModel ? "black" : "white"}>
          {content}
        </StyledText>
      )}
    </StyledDiv>
  </StyledDiv>
);
