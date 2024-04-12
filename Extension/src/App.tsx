import { useState } from "react";
import { StyledDiv } from "./components";
import { ChatScreen, WelcomeScreen } from "./screens";
import { ModelName } from "./types";

import { ToastContainer } from "react-toastify";
import "./toast.css";

function App() {
  const [chosenModel, setChosenModel] = useState<undefined | ModelName>(
    "Sheared LLaMa"
  );

  return (
    <StyledDiv width="100%" height="100vh" p="4px" className="app-container">
      {chosenModel === undefined ? (
        <WelcomeScreen modelSetter={setChosenModel} />
      ) : (
        <ChatScreen model={chosenModel} modelSetter={setChosenModel} />
      )}
      <ToastContainer position="top-right" closeOnClick newestOnTop={true} />
    </StyledDiv>
  );
}

export default App;
