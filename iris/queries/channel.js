const {
  getChannelBySlug,
  getChannelMetaData,
  getChannelMemberCount,
} = require('../models/channel');
const {
  getPendingUsersInChannel,
  getBlockedUsersInChannel,
  getModeratorsInChannel,
  getMembersInChannel,
  getOwnersInChannel,
} = require('../models/usersChannels');
const { getThreadsByChannel } = require('../models/thread');
import paginate from '../utils/paginate-arrays';
import { encode, decode } from '../utils/base64';
import type { PaginationOptions } from '../utils/paginate-arrays';
import type { GetChannelArgs } from '../models/channel';
import type { GraphQLContext } from '../';

module.exports = {
  Query: {
    channel: (_: any, args: GetChannelArgs, { loaders }: GraphQLContext) => {
      if (args.id) return loaders.channel.load(args.id);
      if (args.channelSlug && args.communitySlug)
        return getChannelBySlug(args.channelSlug, args.communitySlug);
      return null;
    },
  },
  Channel: {
    memberCount: ({ id }: { id: string }) => getChannelMemberCount(id),
    threadConnection: (
      { id }: { id: string },
      { first, after }: PaginationOptions
    ) => {
      return getThreadsByChannel(id, {
        first,
        after: after && parseInt(decode(after), 10),
      }).then(threads => ({
        pageInfo: {
          hasNextPage: threads.length >= first,
        },
        edges: threads.map(thread => ({
          cursor: encode(String(thread.lastActive.getTime())),
          node: thread,
        })),
      }));
    },
    community: (
      { communityId }: { communityId: string },
      _: any,
      { loaders }: GraphQLContext
    ) => loaders.community.load(communityId),
    channelPermissions: (args, _: any, { user, loaders }: GraphQLContext) => {
      const channelId = args.id || args.channelId;
      if (!channelId || !user) {
        return {
          isOwner: false,
          isMember: false,
          isModerator: false,
          isBlocked: false,
          isPending: false,
          receiveNotifications: false,
        };
      }
      return loaders.userPermissionsInChannel
        .load([user.id, channelId])
        .then(res => {
          if (!res) {
            return {
              isOwner: false,
              isMember: false,
              isModerator: false,
              isBlocked: false,
              isPending: false,
              receiveNotifications: false,
            };
          }
          return res;
        });
    },
    communityPermissions: (args, _: any, { user, loaders }: Context) => {
      const communityId = args.id || args.communityId;
      if (!communityId || !user) {
        return {
          isOwner: false,
          isMember: false,
          isModerator: false,
          isBlocked: false,
          isPending: false,
          receiveNotifications: false,
        };
      }
      return loaders.userPermissionsInCommunity.load([user.id, communityId]);
    },
    memberConnection: (
      { id },
      { first, after }: PaginationOptions,
      { loaders }: GraphQLContext
    ) => {
      const cursor = decode(after);
      // Get the index from the encoded cursor, asdf234gsdf-2 => ["-2", "2"]
      const lastDigits = cursor.match(/-(\d+)$/);
      const lastUserIndex =
        lastDigits && lastDigits.length > 0 && parseInt(lastDigits[1], 10);

      return getMembersInChannel(id, { first, after: lastUserIndex })
        .then(users => loaders.user.loadMany(users))
        .then(result => ({
          pageInfo: {
            hasNextPage: result && result.length >= first,
          },
          edges: result.filter(Boolean).map((user, index) => ({
            cursor: encode(`${user.id}-${lastUserIndex + index + 1}`),
            node: user,
          })),
        }));
    },
    metaData: ({ id }: { id: string }, _: any, { loaders }: GraphQLContext) => {
      return Promise.all([
        loaders.channelThreadCount.load(id),
        loaders.channelMemberCount.load(id),
      ]).then(([threadCount, memberCount]) => ({
        threads: threadCount ? threadCount.reduction : 0,
        members: memberCount ? memberCount.reduction : 0,
      }));
    },
    pendingUsers: ({ id }: { id: string }, _, { loaders }) => {
      return loaders.channelPendingUsers
        .load(id)
        .then(res => {
          if (!res || res.length === 0) return [];
          return res.reduction.map(rec => rec.userId);
        })
        .then(users => {
          if (!users || users.length === 0) return [];
          return loaders.user.loadMany(users);
        });
    },
    blockedUsers: ({ id }: { id: string }, _, { loaders }) => {
      return getBlockedUsersInChannel(id).then(users =>
        loaders.user.loadMany(users)
      );
    },
    moderators: ({ id }: { id: string }, _, { loaders }) => {
      return getModeratorsInChannel(id).then(users =>
        loaders.user.loadMany(users)
      );
    },
    owners: ({ id }: { id: string }, _, { loaders }) => {
      return getOwnersInChannel(id).then(users => loaders.user.loadMany(users));
    },
  },
};
