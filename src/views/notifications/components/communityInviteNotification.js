// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { getCommunityById } from 'shared/graphql/queries/community/getCommunity';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import { displayLoadingCard } from 'src/components/loading';
import { parseNotificationDate, parseContext, parseActors } from '../utils';
import markSingleNotificationSeenMutation from 'shared/graphql/mutations/notification/markSingleNotificationSeen';
import Icon from 'src/components/icon';
import {
  SegmentedNotificationCard,
  TextContent,
  SegmentedNotificationListRow,
  AttachmentsWash,
  CreatedContext,
  ContentWash,
} from '../style';

const CommunityInviteComponent = ({
  data,
}: {
  data: { community: GetCommunityType },
}) => {
  // TODO @brian
  return null;
};

const CommunityInvite = compose(
  getCommunityById,
  displayLoadingCard
)(CommunityInviteComponent);

export const CommunityInviteNotification = ({
  notification,
  currentUser,
}: {
  notification: Object,
  currentUser: Object,
}) => {
  const date = parseNotificationDate(notification.modifiedAt);
  const context = parseContext(notification.context);
  const actors = parseActors(notification.actors, currentUser, true);

  return (
    <SegmentedNotificationCard>
      <CreatedContext>
        <Icon glyph="community" />
        <TextContent pointer={true}>
          {actors.asObjects[0].name} invited you to join their community,{' '}
          {context.asString} {date}
        </TextContent>
      </CreatedContext>
      <ContentWash>
        <AttachmentsWash>
          <CommunityInvite id={notification.context.payload.id} />
        </AttachmentsWash>
      </ContentWash>
    </SegmentedNotificationCard>
  );
};

type Props = {
  notification: Object,
  currentUser: Object,
  markSingleNotificationSeen: Function,
  markSingleNotificationAsSeenInState: Function,
};

class MiniCommunityInviteNotificationWithMutation extends React.Component<Props> {
  markAsSeen = () => {
    const {
      markSingleNotificationSeen,
      notification,
      markSingleNotificationAsSeenInState,
    } = this.props;
    if (notification.isSeen) return;
    markSingleNotificationAsSeenInState(notification.id);
    markSingleNotificationSeen(notification.id);
  };

  render() {
    const { notification, currentUser } = this.props;

    const date = parseNotificationDate(notification.modifiedAt);
    const context = parseContext(notification.context);
    const actors = parseActors(notification.actors, currentUser, true);

    return (
      <SegmentedNotificationListRow
        isSeen={notification.isSeen}
        onClick={this.markAsSeen}
      >
        <CreatedContext>
          <Icon glyph="community" />
          <TextContent pointer={false}>
            {actors.asObjects[0].name} invited you to join their community,{' '}
            {context.asString} {date}
          </TextContent>
        </CreatedContext>
        <ContentWash mini>
          <AttachmentsWash>
            <CommunityInvite id={notification.context.payload.id} />
          </AttachmentsWash>
        </ContentWash>
      </SegmentedNotificationListRow>
    );
  }
}

export const MiniCommunityInviteNotification = compose(
  markSingleNotificationSeenMutation
)(MiniCommunityInviteNotificationWithMutation);
