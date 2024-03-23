import { useState } from 'react';

import {
  getCurrentTabId,
  scroll,
} from '../../../services';
import { ChatMessage } from '../../../types';
import { StyledDiv } from '../../common';
import { InputField } from './InputField';
import { MessageHistory } from './MessageHistory';

export const Content = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [tabId, setTabId] = useState<number | undefined>(undefined);

  getCurrentTabId()
    .then((tabId) => {
      setTabId(tabId);
    })
    .catch(() => {
      alert("Error finding tabId.");
    });

  const injectScript = () => {
    if (tabId === undefined) {
      alert("The tabId is undefined, please try again in a moment.");
      return;
    }

    // Execute the provided js/ts code in the current active tab
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: () => scroll(500),
      })
      .catch((err: any) => {
        alert(err);
      });
  };

  return (
    <StyledDiv
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
    >
      <MessageHistory history={history} />
      <InputField history={history} setHistory={setHistory} />

      {/* example of how to use injectScript */}
      <button onClick={injectScript}>Scroll</button>
    </StyledDiv>
  );
};
