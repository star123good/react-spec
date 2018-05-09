// @flow
import type { GraphQLContext } from '../../';
import UserError from '../../utils/UserError';
import { removeMembersInChannel } from '../../models/usersChannels';
import { getChannelById, deleteChannel } from '../../models/channel';
import { getThreadsByChannelToDelete, deleteThread } from '../../models/thread';
import {
  isAuthedResolver as requireAuth,
  canModerateChannel,
} from '../../utils/permissions';
import { events } from 'shared/analytics';
import { getEntityDataForAnalytics } from '../../utils/analytics';

export default requireAuth(
  async (
    _: any,
    { channelId }: { channelId: string },
    { user, loaders, track }: GraphQLContext
  ) => {
    const defaultTrackingData = await getEntityDataForAnalytics(loaders)({
      channelId,
      userId: user.id,
    });

    if (!await canModerateChannel(user.id, channelId, loaders)) {
      track(events.CHANNEL_DELETED_FAILED, {
        ...defaultTrackingData,
        reason: 'no permission',
      });
      return new UserError('You don’t have permission to manage this channel');
    }

    const channel = await getChannelById(channelId);

    if (channel.slug === 'general') {
      track(events.CHANNEL_DELETED_FAILED, {
        ...defaultTrackingData,
        reason: 'general channel',
      });

      return new UserError("The general channel can't be deleted");
    }

    const [allThreadsInChannel] = await Promise.all([
      getThreadsByChannelToDelete(channelId),
      deleteChannel(channelId),
      removeMembersInChannel(channelId),
    ]);

    track(events.CHANNEL_DELETED, defaultTrackingData);

    if (allThreadsInChannel.length === 0) return true;

    return allThreadsInChannel.map(async thread => {
      const threadTrackingData = await getEntityDataForAnalytics(loaders)({
        threadId: thread.id,
        userId: user.id,
      });

      track(events.THREAD_DELETED, threadTrackingData);

      return deleteThread(thread.id);
    });
  }
);
