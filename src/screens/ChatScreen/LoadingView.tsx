// ScaleLoader and SyncLoader also nice
import React from "react";

import BeatLoader from "react-spinners/BeatLoader";

import { StyledDiv } from "../../components/StyledDiv";

export const LoadingView = () => {
  return (
    <StyledDiv
      data-testid="load-view"
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <BeatLoader data-testid="beat-load" size={4} speedMultiplier={0.4} />
    </StyledDiv>
  );
};
