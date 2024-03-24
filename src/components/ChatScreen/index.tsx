import { ModelName } from "../../types";
import { StyledDiv, StyledText } from "../common";
import { Content } from "./Content";

export const Header = () => (
  <StyledDiv display="flex" justifyContent="center">
    <StyledText variant="title">Web Assist</StyledText>
  </StyledDiv>
);

type ChatScreenProps = {
  model: ModelName;
};

export const ChatScreen = ({ model }: ChatScreenProps) => (
  <StyledDiv height="100%" width="100%">
    <Header />
    <Content />
  </StyledDiv>
);
