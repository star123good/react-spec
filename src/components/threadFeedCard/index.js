// @flow
import React from 'react';
import truncate from 'shared/truncate';
import compose from 'recompose/compose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Link from 'src/components/link';
import Icon from '../../components/icons';
import FacePile from './facePile';
import FormattedThreadLocation from './formattedThreadLocation';
import {
  StyledThreadFeedCard,
  CardContent,
  CardLink,
  Title,
  MessageCount,
  Pinned,
  PinnedBanner,
  PinnedIconWrapper,
  ContentInfo,
  MetaNew,
} from './style';

const ThreadFeedCardPure = (props: Object): React$Element<any> => {
  const {
    location: { pathname },
    data: { participants },
  } = props;
  const participantsExist = participants && participants.length > 0;

  return (
    <StyledThreadFeedCard>
      <CardLink
        to={{
          pathname: pathname,
          search: `?thread=${props.data.id}`,
        }}
      />
      <CardContent>
        <FormattedThreadLocation {...props} />
        <Link
          to={{
            pathname: pathname,
            search: `?thread=${props.data.id}`,
          }}
        >
          <Title>{truncate(props.data.content.title, 80)}</Title>
          {props.isPinned && (
            <Pinned>
              <PinnedBanner />
              <PinnedIconWrapper>
                <Icon glyph="pin-fill" size={24} />
              </PinnedIconWrapper>
            </Pinned>
          )}
        </Link>
        <ContentInfo>
          {participantsExist && <FacePile {...props} />}
          {props.data.messageCount > 0 ? (
            <MessageCount>
              <Icon size={20} glyph="message-fill" />
              <span>{props.data.messageCount}</span>
            </MessageCount>
          ) : (
            <MetaNew>
              <Icon size={20} glyph="notification-fill" />
              <span>Fresh thread!</span>
            </MetaNew>
          )}
        </ContentInfo>
      </CardContent>
    </StyledThreadFeedCard>
  );
};

const ThreadFeedCard = compose(withRouter)(ThreadFeedCardPure);
export default connect()(ThreadFeedCard);
