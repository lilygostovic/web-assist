import styled, { css } from "styled-components";
import {
  color,
  type ColorProps,
  flexbox,
  type FlexboxProps,
  layout,
  type LayoutProps,
  space,
  type SpaceProps,
  typography,
  type TypographyProps,
} from "styled-system";

export type TextVariant =
  | "title"
  | "subtitle"
  | "welcomeText"
  | "backButton"
  | "continueButton";

type StyledTextProps = {
  variant: TextVariant;
} & ColorProps &
  FlexboxProps &
  LayoutProps &
  SpaceProps &
  TypographyProps;

export const StyledText = styled.text<StyledTextProps>`
  ${({ variant }) => {
    switch (variant) {
      case "title":
        return css`
          font-size: 18px;
          font-weight: 500;
        `;
      case "subtitle":
        return css`
          font-weight: 500;
          color: #a15dc4;
          text-align: center;
        `;
      case "welcomeText":
        return css`
          font-weight: 400;
          text-align: center;
          line-height: 1.5;
          color: #424242;
        `;
      case "homeButton":
        return css`
          font-weight: 500;
        `;
      case "continueButton":
        return css`
          color: #a15dc4;
          font-weight: 500;
        `;
      case "disabledContinueButton":
        return css`
          color: #c3c3c3;
          font-weight: 500;
        `;
    }
  }}

  ${color}
  ${space}
  ${typography}
  ${flexbox}
  ${layout}
`;
