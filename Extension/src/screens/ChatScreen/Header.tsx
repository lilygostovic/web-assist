import { ModelNames } from "../../types";
import { StyledDiv, StyledText } from "../../components";
import { generateSessionID } from "./InputField/helper";

type HeaderProps = {
  model: string;
  modelSetter: React.Dispatch<React.SetStateAction<string | undefined>>;
  sessionID: string;
  sessionSetter: React.Dispatch<React.SetStateAction<string>>;
};

export const Header = ({
  model,
  modelSetter,
  sessionID,
  sessionSetter,
}: HeaderProps) => (
  <StyledDiv
    height="7vh"
    display="flex"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
    mb="4px"
    position="sticky" // Make the header sticky
    top="0" // Stick it to the top of the viewport
    zIndex="999" // Ensure it's above other content
  >
    <select
      value={model}
      onChange={(e) => modelSetter(e.target.value)}
      style={{
        // Customize select element style
        border: "none",
        background: "transparent",
        padding: "0.5rem",
        fontWeight: "500",
        color: "#a15dc4",
        textAlign: "center",
      }}
    >
      {ModelNames.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>

    <StyledDiv
      display="flex"
      width="100%"
      justifyContent="center"
      flexDirection="column"
    >
      <StyledText variant="title">Web Assist</StyledText>
      <StyledText variant="subtitle">Session {sessionID}</StyledText>
    </StyledDiv>

    <StyledDiv
      onClick={() => sessionSetter(generateSessionID())}
      style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
    >
      <StyledText variant="homeButton">New Session</StyledText>
    </StyledDiv>
  </StyledDiv>
);
