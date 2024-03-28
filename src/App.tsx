import { useState } from "react";

import { StyledDiv } from "./components";
import { ChatScreen, WelcomeScreen } from "./screens";
import { ModelName } from "./types";

function App() {
  // TODO:: set default to undefined, just like this for ease of testing
  const [chosenModel, setChosenModel] = useState<undefined | ModelName>(
    "GPT-4"
  );

  return (
    <StyledDiv width="300px" height="450px" p="4px">
      {chosenModel === undefined ? (
        <WelcomeScreen modelSetter={setChosenModel} />
      ) : (
        <ChatScreen modelName={chosenModel} modelSetter={setChosenModel} />
      )}
    </StyledDiv>
  );
}

export default App;
