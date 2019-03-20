// @flow
import theme from 'shared/theme';
import styled from 'styled-components';
import { Truncate } from 'src/components/globals';
import { Link } from 'react-router-dom';

export const CardLink = styled(Link)`
  display: block;
  position: relative;
`;

export const Row = styled.div`
  padding: 12px 16px;
  align-items: center;
  display: grid;
  grid-template-rows: auto;
  grid-template-areas: 'content actions';
  grid-template-columns: 1fr auto;
  background: ${theme.bg.default};
  border-bottom: 1px solid ${theme.bg.divider};
  grid-gap: 16px;

  &:hover {
    background: ${theme.bg.wash};
    cursor: pointer;
  }
`;

export const RowWithAvatar = styled.div`
  padding: 12px 16px;
  align-items: center;
  display: grid;
  grid-template-areas: 'avatar content actions';
  grid-template-columns: min-content 1fr auto;
  grid-template-rows: auto;
  background: ${theme.bg.default};
  border-bottom: 1px solid ${theme.bg.divider};
  grid-gap: 16px;

  &:hover {
    background: ${theme.bg.wash};
    cursor: pointer;
  }
`;

export const UserAvatarContainer = styled.div`
  height: 40px;
  grid-area: avatar;
  align-self: flex-start;
`;

export const CommunityAvatarContainer = styled.div`
  height: 32px;
  grid-area: avatar;
  align-self: flex-start;
`;

export const Content = styled.div`
  grid-area: content;
  display: grid;
`;

export const Label = styled.div`
  color: ${theme.text.default};
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  display: inline-block;
  ${Truncate};

  .icon {
    color: ${theme.text.secondary};
    margin-right: 6px;
    position: relative;
    top: 1px;
  }
`;

export const Sublabel = styled.span`
  font-size: 15px;
  color: ${theme.text.alt};
  font-weight: 400;
  line-height: 1.2;
  display: inline-block;
  ${Truncate};
`;

export const Description = styled.p`
  font-size: 15px;
  line-height: 1.3;
  color: ${theme.text.default};
  margin-top: 6px;
  padding-right: 24px;
  word-break: break-word;
`;

export const Actions = styled.div`
  grid-area: actions;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  justify-content: flex-start;
  position: relative;
  z-index: 10;
  color: ${theme.text.alt};
  flex: 1;
  padding-top: 4px;
`;
