import { ModelNames, ChatMessage, PrevTurn } from "../../types";
import { StyledDiv, StyledText } from "../../components";
import { generateSessionID } from "./InputField/helper";

type HeaderProps = {
  model: string;
  modelSetter: React.Dispatch<React.SetStateAction<string>>;
  sessionID: string;
  sessionSetter: React.Dispatch<React.SetStateAction<string>>;
  historySetter: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  prevTurnSetter: React.Dispatch<React.SetStateAction<null | PrevTurn>>;
};

export const Header = ({
  model,
  modelSetter,
  sessionID,
  sessionSetter,
  historySetter,
  prevTurnSetter,
}: HeaderProps) => {
  const handleNewSession = () => {
    sessionSetter(generateSessionID());
    historySetter([]);
    prevTurnSetter(null);
  };

  return (
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
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <span
          title="WebAssist is an innovative browser extension designed to enable users to converse with Large Language Models towards accomplishing real-world tasks within web browsers."
          style={{ cursor: "help" }}
        >
          <StyledText variant="title">Web Assist</StyledText>
        </span>
        <StyledText variant="welcomeText">Session {sessionID}</StyledText>
      </StyledDiv>

      <StyledDiv
        onClick={handleNewSession}
        style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
      >
        <StyledText variant="subtitle">New Session</StyledText>
      </StyledDiv>
    </StyledDiv>
  );
};
