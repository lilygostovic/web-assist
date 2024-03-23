import {
  StyledDiv,
  StyledText,
} from '../common';
import { Content } from './Content';

export const Header = () => (
  <StyledDiv display="flex" justifyContent="center">
    <StyledText variant="title">Web Assist</StyledText>
  </StyledDiv>
);

export const ChatScreen = () => (
  <StyledDiv height="100%" width="100%">
    <Header />
    <Content />
  </StyledDiv>
);
