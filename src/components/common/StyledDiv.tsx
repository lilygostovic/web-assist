import styled from 'styled-components';
import {
  border,
  type BorderProps,
  boxShadow,
  type BoxShadowProps,
  color,
  type ColorProps,
  flexbox,
  type FlexboxProps,
  layout,
  type LayoutProps,
  position,
  type PositionProps,
  space,
  type SpaceProps,
} from 'styled-system';

type StyledDivProps = SpaceProps &
  LayoutProps &
  FlexboxProps &
  ColorProps &
  BorderProps &
  PositionProps &
  BoxShadowProps;

export const StyledDiv = styled.div<StyledDivProps>`
  ${color}
  ${space}
  ${layout}
  ${flexbox}
  ${border}
  ${position}
  ${boxShadow}
`;
