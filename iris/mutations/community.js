// $FlowFixMe
import UserError from '../utils/UserError';
import {
  createCommunity,
  editCommunity,
  deleteCommunity,
  getCommunities,
  getCommunitiesBySlug,
  unsubscribeFromAllChannelsInCommunity,
  getCommunityById,
  setPinnedThreadInCommunity,
} from '../models/community';
import {
  createGeneralChannel,
  getChannelsByCommunity,
  getChannelsByUserAndCommunity,
  deleteChannel,
  getChannels,
} from '../models/channel';
import {
  createMemberInDefaultChannels,
  createOwnerInChannel,
  removeMemberInChannel,
  removeMembersInChannel,
} from '../models/usersChannels';
import {
  createOwnerInCommunity,
  createMemberInCommunity,
  removeMemberInCommunity,
  removeMembersInCommunity,
  getUserPermissionsInCommunity,
} from '../models/usersCommunities';
import type {
  CreateCommunityArguments,
  EditCommunityArguments,
} from '../models/community';
import { getUserById } from '../models/user';
import { getThreads } from '../models/thread';
import { getSlackImport, markSlackImportAsSent } from '../models/slackImport';
import { getThreadsByCommunity, deleteThread } from '../models/thread';
import { communitySlugIsBlacklisted } from '../utils/permissions';
import { addQueue } from '../utils/workerQueue';

module.exports = {
  Mutation: {
    createCommunity: (_, args: CreateCommunityArguments, { user }) => {
      const currentUser = user;
      // user must be authed to create a community
      if (!currentUser) {
        return new UserError(
          'You must be signed in to create a new community.'
        );
      }

      if (!args.input.slug || args.input.slug.length === 0) {
        return new UserError(
          'Communities must have a valid url so people can find it!'
        );
      }

      // replace any non alpha-num characters to prevent bad community slugs
      // (/[\W_]/g, "-") => replace non-alphanum with hyphens
      // (/-{2,}/g, '-') => replace multiple hyphens in a row with one hyphen
      const sanitizedSlug = args.input.slug
        .replace(/[\W_]/g, '-')
        .replace(/-{2,}/g, '-');
      const sanitizedArgs = Object.assign(
        {},
        {
          ...args,
          input: {
            ...args.input,
            slug: sanitizedSlug,
          },
        }
      );

      if (communitySlugIsBlacklisted(sanitizedSlug)) {
        return new UserError(
          `This url is already taken - feel free to change it if
          you're set on the name ${args.input.name}!`
        );
      }

      // get communities with the input slug to check for duplicates
      return (
        getCommunitiesBySlug([sanitizedSlug])
          .then(communities => {
            // if a community with this slug already exists
            if (communities.length > 0) {
              return new UserError(
                'A community with this slug already exists.'
              );
            }
            // all checks passed
            return createCommunity(sanitizedArgs, currentUser);
          })
          .then(community => {
            // create a new relationship with the community
            const communityRelationship = createOwnerInCommunity(
              community.id,
              currentUser.id
            );

            // create a default 'general' channel
            const generalChannel = createGeneralChannel(
              community.id,
              currentUser.id
            );

            return Promise.all([
              community,
              communityRelationship,
              generalChannel,
            ]);
          })
          .then(([community, communityRelationship, generalChannel]) => {
            // create a new relationship with the general channel
            const generalChannelRelationship = createOwnerInChannel(
              generalChannel.id,
              currentUser.id
            );

            return Promise.all([community, generalChannelRelationship]);
          })
          // return only the newly created community
          .then(data => data[0])
      );
    },
    deleteCommunity: (_, { communityId }, { user }) => {
      const currentUser = user;

      // user must be authed to delete a community
      if (!currentUser) {
        return new UserError(
          'You must be signed in to make changes to this community.'
        );
      }

      const currentUserCommunityPermissions = getUserPermissionsInCommunity(
        communityId,
        currentUser.id
      );
      const communities = getCommunities([communityId]);

      return (
        Promise.all([currentUserCommunityPermissions, communities])
          .then(([currentUserCommunityPermissions, communities]) => {
            const communityToEvaluate = communities[0];

            // if no community was found or was deleted
            if (!communityToEvaluate || communityToEvaluate.deletedAt) {
              return new UserError("This community doesn't exist.");
            }

            // user must own the community to delete the community
            if (!currentUserCommunityPermissions.isOwner) {
              return new UserError(
                "You don't have permission to make changes to this community."
              );
            }

            // delete the community requested from the client
            const deleteTheInputCommunity = deleteCommunity(communityId);
            // get all the threads in the community to prepare for deletion
            const getAllThreadsInCommunity = getThreadsByCommunity(communityId);
            // remove all the UsersCommunities objects in the db
            const removeRelationshipsToCommunity = removeMembersInCommunity(
              communityId
            );
            // get all the channels in the community
            const getAllChannelsInCommunity = getChannelsByCommunity(
              communityId
            );

            return Promise.all([
              communityToEvaluate,
              deleteTheInputCommunity,
              getAllThreadsInCommunity,
              removeRelationshipsToCommunity,
              getAllChannelsInCommunity,
            ]);
          })
          .then(
            (
              [
                communityToEvaluate,
                deletedCommunity,
                allThreadsInCommunity,
                relationshipsToCommunity,
                allChannelsInCommunity,
              ]
            ) => {
              // after a community has been deleted, we need to mark all the channels
              // as deleted
              const removeAllChannels = allChannelsInCommunity.map(channel =>
                deleteChannel(channel.id)
              );
              // and remove all relationships to the deleted channels
              const removeAllRelationshipsToChannels = allChannelsInCommunity.map(
                channel => removeMembersInChannel(channel.id)
              );
              // and mark all the threads in that community as deleted
              const removeAllThreadsInCommunity = allThreadsInCommunity.map(
                thread => deleteThread(thread.id)
              );

              return Promise.all([
                communityToEvaluate,
                removeAllChannels,
                removeAllRelationshipsToChannels,
                removeAllThreadsInCommunity,
              ]);
            }
          )
          // return only the community that was being evaluated
          .then(data => data[0])
      );
    },
    editCommunity: (_, args: EditCommunityArguments, { user }) => {
      const currentUser = user;

      // user must be authed to edit a community
      if (!currentUser) {
        return new UserError(
          'You must be signed in to make changes to this community.'
        );
      }

      const currentUserCommunityPermissions = getUserPermissionsInCommunity(
        args.input.communityId,
        currentUser.id
      );
      const communities = getCommunities([args.input.communityId]);

      return Promise.all([
        currentUserCommunityPermissions,
        communities,
      ]).then(([currentUserCommunityPermissions, communities]) => {
        const communityToEvaluate = communities[0];

        // if no community was found or was deleted
        if (!communityToEvaluate || communityToEvaluate.deletedAt) {
          return new UserError("This community doesn't exist.");
        }

        // user must own the community to edit the community
        if (!currentUserCommunityPermissions.isOwner) {
          return new UserError(
            "You don't have permission to make changes to this community."
          );
        }

        // all checks passed
        return editCommunity(args);
      });
    },
    toggleCommunityMembership: (_, { communityId }, { user }) => {
      const currentUser = user;

      // user must be authed to join a community
      if (!currentUser) {
        return new UserError('You must be signed in to join this community.');
      }

      // get the current user's permissions in the community
      const currentUserCommunityPermissions = getUserPermissionsInCommunity(
        communityId,
        currentUser.id
      );

      // get the community to evaluate
      const communities = getCommunities([communityId]);

      return Promise.all([
        currentUserCommunityPermissions,
        communities,
      ]).then(([currentUserCommunityPermissions, communities]) => {
        // select the community
        const communityToEvaluate = communities[0];

        // if community wasn't found or was deleted
        if (!communityToEvaluate || communityToEvaluate.deletedAt) {
          return new UserError("This community doesn't exist");
        }

        // user is blocked, they can't join the community
        if (currentUserCommunityPermissions.isBlocked) {
          return new UserError("You don't have permission to do that.");
        }

        // if the person owns the community, they have accidentally triggered
        // a join or leave action, which isn't allowed
        if (currentUserCommunityPermissions.isOwner) {
          return new UserError(
            "Owners of a community can't join or leave their own community."
          );
        }

        // if the user is a member of the community, it means they are trying
        // to leave the community
        if (currentUserCommunityPermissions.isMember) {
          // remove the relationship of the user to the community
          const removeRelationshipToCommunity = removeMemberInCommunity(
            communityId,
            currentUser.id
          );

          // returns an array of channel ids the user is a member of and public channels as well
          const getAllChannelsInCommunity = getChannelsByUserAndCommunity(
            communityId,
            currentUser.id
          );

          return Promise.all([
            communityToEvaluate,
            removeRelationshipToCommunity,
            getAllChannelsInCommunity,
          ]).then(
            (
              [
                communityToEvaluate,
                removedRelationshipToCommunity,
                allChannelsInCommunity,
              ]
            ) => {
              // remove all relationships to the community's channels
              const removeAllRelationshipsToChannels = Promise.all(
                allChannelsInCommunity.map(channel =>
                  removeMemberInChannel(channel.id, currentUser.id)
                )
              );

              return (
                Promise.all([
                  communityToEvaluate,
                  removeAllRelationshipsToChannels,
                ])
                  // return the community that was being evaluated
                  .then(data => data[0])
              );
            }
          );
        } else {
          // the user is not a member of the current community, so create a new
          // relationship to the community and then create a relationship
          // with all default channels

          // make sure the user isn't blocked
          if (currentUserCommunityPermissions.isBlocked) {
            return new UserError(
              "You don't have permission to join this community."
            );
          }

          // create a new relationship to the community
          const joinCommunity = createMemberInCommunity(
            communityId,
            currentUser.id
          );

          return (
            Promise.all([
              communityToEvaluate,
              joinCommunity,
              // join the user to all the default channels in the community
              createMemberInDefaultChannels(communityId, currentUser.id),
            ])
              // return the evaluated cmomunity
              .then(data => data[0])
          );
        }
      });
    },
    sendSlackInvites: (_, { input }, { user }) => {
      const currentUser = user;

      if (!currentUser) {
        return new UserError(
          'You must be signed in to invite people to this community.'
        );
      }

      // make sure the user is the owner of the community
      return (
        getUserPermissionsInCommunity(input.id, currentUser.id)
          .then(permissions => {
            if (!permissions.isOwner) {
              return new UserError(
                "You don't have permission to invite people to this community."
              );
            }

            // get the slack import to make sure it hasn't already been sent before
            return getSlackImport(input.id);
          })
          .then(result => {
            // if no slack import exists
            if (!result) {
              return new UserError(
                'No Slack team is connected to this community. Try reconnecting.'
              );
            }
            // if the slack import was already sent
            if (result.sent && result.sent !== null) {
              return new UserError(
                'This Slack team has already been invited to join your community!'
              );
            }

            // mark the slack import for this community as sent
            return markSlackImportAsSent(input.id);
          })
          .then(inviteRecord => {
            if (inviteRecord.members.length === 0) {
              return new UserError('This Slack team has no members to invite!');
            }

            // for each member on the invite record, send a community invitation
            return inviteRecord.members
              .filter(user => !!user.email)
              .filter(user => user.email !== currentUser.email)
              .map(user => {
                return addQueue('community invite notification', {
                  recipient: {
                    email: user.email,
                    firstName: user.firstName ? user.firstName : null,
                    lastName: user.lastName ? user.lastName : null,
                  },
                  communityId: inviteRecord.communityId,
                  senderId: inviteRecord.senderId,
                  customMessage: input.customMessage,
                });
              });
          })
          // send the community record back to the client
          .then(async () => {
            const [{ members, teamName }, community, user] = await Promise.all([
              getSlackImport(input.id),
              getCommunityById(input.id),
              getUserById(currentUser.id),
            ]);

            const invitedCount = members
              .filter(user => !!user.email)
              .filter(user => user.email !== currentUser.email).length;

            addQueue('admin slack import processed email', {
              user,
              community,
              invitedCount,
              teamName,
            });

            return community;
          })
      );
    },
    sendEmailInvites: (_, { input }, { user }) => {
      const currentUser = user;

      if (!currentUser) {
        return new UserError(
          'You must be signed in to invite people to this community.'
        );
      }

      // make sure the user is the owner of the community
      return getUserPermissionsInCommunity(
        input.id,
        currentUser.id
      ).then(permissions => {
        if (!permissions.isOwner) {
          return new UserError(
            "You don't have permission to invite people to this community."
          );
        } else {
          return input.contacts
            .filter(user => user.email !== currentUser.email)
            .map(user => {
              return addQueue('community invite notification', {
                recipient: {
                  email: user.email,
                  firstName: user.firstName ? user.firstName : null,
                  lastName: user.lastName ? user.lastName : null,
                },
                communityId: input.id,
                senderId: currentUser.id,
                customMessage: input.customMessage ? input.customMessage : null,
              });
            });
        }
      });
    },
    pinThread: (_, { threadId, communityId, value }, { user }) => {
      const currentUser = user;
      if (!currentUser) {
        return new UserError(
          'You must be signed in to pin a thread in this community.'
        );
      }

      const promises = [
        getUserPermissionsInCommunity(communityId, currentUser.id),
        getThreads([threadId]),
      ];

      return Promise.all([...promises])
        .then(([permissions, threads]) => {
          if (!permissions.isOwner) {
            return new UserError("You don't have permission to do this.");
          }

          const threadToEvaluate = threads[0];

          // we have to ensure the thread isn't in a private channel
          return getChannels([threadToEvaluate.channelId]);
        })
        .then(channels => {
          if (channels[0].isPrivate) {
            return new UserError(
              'Only threads in public channels can be pinned.'
            );
          }
          return setPinnedThreadInCommunity(communityId, value);
        });
    },
  },
};
