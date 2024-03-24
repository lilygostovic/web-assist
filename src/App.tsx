import { useState } from "react";

import { ChatScreen, StyledDiv, WelcomeScreen } from "./components";
import { ModelName } from "./types";

function App() {
  const [chosenModel, setChosenModel] = useState<undefined | ModelName>(
    undefined
  );

  return (
    <StyledDiv width="300px" height="400px" p="4px">
      {chosenModel === undefined ? (
        <WelcomeScreen modelSetter={setChosenModel} />
      ) : (
        <ChatScreen modelName={chosenModel} modelSetter={setChosenModel} />
      )}
    </StyledDiv>
  );
}

export default App;
