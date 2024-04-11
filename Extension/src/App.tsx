import { useState } from "react";

import { StyledDiv } from "./components";
import { ChatScreen, WelcomeScreen } from "./screens";
import { ModelName } from "./types";

function App() {
  const [chosenModel, setChosenModel] = useState<undefined | ModelName>(
    undefined
  );

  return (
    <StyledDiv width="100%" height="100%" p="4px" className="app-container">
      {chosenModel === undefined ? (
        <WelcomeScreen modelSetter={setChosenModel} />
      ) : (
        <ChatScreen modelName={chosenModel} modelSetter={setChosenModel} />
      )}
    </StyledDiv>
  );
}

export default App;
