import { ChatBubble } from "../common/ChatBubble";
import { StyledDiv } from "../common/StyledDiv";

export const Content = () => (
  <StyledDiv width="300px" height="400px">
    <ChatBubble
      content="Hi, CWN Model! Nice to meet you, my name is lily and i am blind so i need lots of help navigating the web"
      isUser
    />
    <ChatBubble content="Hi, user!" />
  </StyledDiv>
);
