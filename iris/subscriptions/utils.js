// @flow
import { getUserPermissionsInChannel } from '../models/usersChannels';
import { getMembersInDirectMessageThread } from '../models/usersDirectMessageThreads';
import { getChannels } from '../models/channel';
import type { DBThread } from '../models/thread';
import type { GraphQLContext } from '../';

// Check that a user can view a channel
export const userCanViewChannel = async (channelId: string, userId: string) => {
  const [channel] = await getChannels([channelId]);
  // Everybody can view public channels
  if (!channel.isPrivate) return true;

  // If you're not signed in you can't subscribe to private channels
  if (!userId) return false;

  const { isMember } = await getUserPermissionsInChannel(channelId, userId);
  return isMember;
};

export const userCanViewDirectMessageThread = async (
  threadId: string,
  userId: string
) => {
  const members = await getMembersInDirectMessageThread(threadId);
  if (!members) return false;
  return members.some(member => member.userId === userId);
};
