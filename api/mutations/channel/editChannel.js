// @flow
import type { GraphQLContext } from '../../';
import type { EditChannelInput } from '../../models/channel';
import UserError from '../../utils/UserError';
import { approvePendingUsersInChannel } from '../../models/usersChannels';
import { editChannel, getChannelById } from '../../models/channel';
import {
  isAuthedResolver as requireAuth,
  canModerateChannel,
} from '../../utils/permissions';

export default requireAuth(
  async (_: any, args: EditChannelInput, { user, loaders }: GraphQLContext) => {
    if (!await canModerateChannel(user.id, args.input.channelId, loaders)) {
      return new UserError('You don’t have permission to manage this channel');
    }

    const channel = await getChannelById(args.input.channelId);

    if (channel.isPrivate && !args.input.isPrivate) {
      approvePendingUsersInChannel(args.input.channelId);
    }

    return editChannel(args);
  }
);
