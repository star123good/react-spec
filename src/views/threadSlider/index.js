import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import type { Location, History, Match } from 'react-router';
import Icon from 'src/components/icons';
import { ThreadView } from 'src/views/thread';
import { ErrorBoundary } from 'src/components/error';
import { ESC } from 'src/helpers/keycodes';
import { setTitlebarProps } from 'src/actions/titlebar';
import {
  Container,
  Overlay,
  ThreadContainer,
  CloseButton,
  ThreadContainerBackground,
} from './style';

type Props = {
  previousLocation: Location,
  history: History,
  match: Match,
};

const ThreadSlider = (props: Props) => {
  const { previousLocation, history, match, titlebar, dispatch } = props;
  const prevTitlebarProps = useRef(titlebar);
  const { params } = match;
  const { threadId } = params;

  const closeSlider = (e: any) => {
    e && e.stopPropagation();
    history.push({ ...previousLocation, state: { modal: false } });
  };

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      if (e.keyCode === ESC) {
        e.stopPropagation();
        closeSlider();
      }
    };

    document.addEventListener('keydown', handleKeyPress, false);
    return () => {
      const prev = prevTitlebarProps.current;
      dispatch(setTitlebarProps({ ...prev }));
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Container data-cy="thread-slider">
        <Overlay onClick={closeSlider} data-cy="thread-slider-overlay" />

        <CloseButton data-cy="thread-slider-close" onClick={closeSlider}>
          <Icon glyph="view-close" size={32} />
        </CloseButton>

        <ThreadContainerBackground />

        <ThreadContainer>
          <ThreadView threadId={threadId} />
        </ThreadContainer>
      </Container>
    </ErrorBoundary>
  );
};

const map = state => ({ titlebar: state.titlebar });
export default connect(map)(ThreadSlider);
