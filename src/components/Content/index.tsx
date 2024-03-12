import { useState } from "react";

import { ChatMessage } from "../../types";
import { StyledDiv } from "../common/StyledDiv";
import { InputField } from "./InputField";
import { MessageHistory } from "./MessageHistory";

export const Content = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);

  return (
    <StyledDiv
      width="300px"
      height="400px"
      display="flex"
      flexDirection="column"
      px="4px"
      pb="4px"
    >
      <MessageHistory history={history} />
      <InputField history={history} setHistory={setHistory} />
    </StyledDiv>
  );
};
