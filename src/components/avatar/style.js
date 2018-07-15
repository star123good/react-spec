// @flow
import styled, { css } from 'styled-components';
import ReactImage from 'react-image';
import { zIndex } from '../globals';
import Link from 'src/components/link';
import { ProfileHeaderAction } from '../profile/style';

export const Status = styled.div`
  position: relative;
  display: inline-block;
  width: ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  border: none;
  background-color: ${({ theme }) => theme.bg.default};

  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: 768px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};

  &:after {
    content: '';
    position: absolute;
    display: ${props => (props.isOnline ? 'inline-block' : 'none')};
    width: ${props => (props.onlineSize === 'large' ? '8px' : '6px')};
    height: ${props => (props.onlineSize === 'large' ? '8px' : '6px')};
    background: ${props => props.theme.success.alt};
    border-radius: ${props =>
      props.type === 'community' ? `${props.size / 8}px` : '100%'};
    border: 2px solid ${props => props.theme.text.reverse};
    bottom: ${props =>
      props.onlineSize === 'large'
        ? '0'
        : props.onlineSize === 'small'
          ? '-1px'
          : '1px'};
    right: ${props =>
      props.onlineSize === 'large'
        ? '0'
        : props.onlineSize === 'small'
          ? '-6px'
          : '-3px'};
    z-index: ${zIndex.avatar};
  }
`;

export const AvatarLink = styled(Link)`
  display: flex;
  flex: none;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
`;

export const CoverAction = styled(ProfileHeaderAction)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: ${zIndex.tooltip + 1};
`;

export const Img = styled(ReactImage)`
  display: inline-block;
  width: ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  object-fit: cover;
  background-color: ${props => props.theme.bg.default};

  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: 768px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`;

export const FallbackImg = styled.img`
  display: inline-block;
  width: ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  object-fit: cover;
  background-color: ${props => props.theme.bg.wash};

  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: 768px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`;

export const LoadingImg = styled.div`
  display: inline-block;
  width: ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  background: ${props => props.theme.bg.wash};

  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: 768px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`;
