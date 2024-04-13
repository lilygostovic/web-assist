import { StyledDiv, StyledText } from "../../../components";
import { LoadingView } from "../LoadingView";

type ChatBubbleProps = {
  content?: string;
  speaker?: string;
  isLoading?: boolean;
};

export const ChatBubble = ({
  content,
  speaker,
  isLoading = false,
}: ChatBubbleProps) => {
  // Default to model or action
  let bubble_position = "left";
  let bubble_pr = "20%";
  let bubble_pl = "0px";
  let bubble_bg = "#E9E9EB";
  let text_color = "black";

  if (speaker !== undefined && speaker !== null) {
    // if this is an action that was performed, we have a slightly different style
    switch (speaker) {
      case "action":
        text_color = "#c3c3c3";
        bubble_bg = "transparent";
        break;
      case "user":
        bubble_position = "right";
        bubble_pr = "0px";
        bubble_pl = "20%";
        bubble_bg = "#8b25be";
        text_color = "white";
        break;
    }
  }

  return (
    <StyledDiv
      display="flex"
      justifyContent={bubble_position}
      pr={bubble_pr}
      pl={bubble_pl}
    >
      <StyledDiv
        bg={bubble_bg}
        display="inline-block"
        borderRadius={16}
        my="2px"
        p="8px"
      >
        {isLoading ? (
          <LoadingView />
        ) : (
          <StyledText variant="chatBubble" color={text_color}>
            {content}
          </StyledText>
        )}
      </StyledDiv>
    </StyledDiv>
  );
};
