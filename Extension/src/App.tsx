import "./toast.css";

import { useState } from "react";

import { ToastContainer } from "react-toastify";

import { StyledDiv } from "./components";
import { ChatScreen } from "./screens";

function App() {
  const [chosenModel, setChosenModel] = useState<string>("Sheared LLaMa");

  return (
    <StyledDiv width="100%" height="100vh" p="4px" className="app-container">
      <ChatScreen model={chosenModel} modelSetter={setChosenModel} />
      <ToastContainer position="top-right" closeOnClick newestOnTop={true} />
    </StyledDiv>
  );
}

export default App;
