import { StyledDiv } from "./common/StyledDiv";
import { StyledText } from "./common/StyledText";
import { Content } from "./Content";

export const Header = () => (
  <StyledDiv display="flex" justifyContent="center">
    <StyledText variant="title">Web Assist</StyledText>
  </StyledDiv>
);

export const HomePage = () => (
  <div>
    <Header />
    <Content />
  </div>
);
