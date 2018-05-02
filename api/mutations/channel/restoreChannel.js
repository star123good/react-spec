// @flow
import type { GraphQLContext } from '../../';
import UserError from '../../utils/UserError';
import { getChannelById, restoreChannel } from '../../models/channel';
import {
  isAuthedResolver as requireAuth,
  canModerateChannel,
} from '../../utils/permissions';

export default requireAuth(
  async (
    _: any,
    { input: { channelId } }: { input: { channelId: string } },
    { user, loaders }: GraphQLContext
  ) => {
    if (!await canModerateChannel(user.id, channelId, loaders)) {
      return new UserError('You don’t have permission to manage this channel');
    }

    const channel = await getChannelById(channelId);

    if (!channel.archivedAt) {
      return new UserError('Channel already restored');
    }

    return await restoreChannel(channelId);
  }
);
