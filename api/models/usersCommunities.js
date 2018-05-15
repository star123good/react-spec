// @flow
const { db } = require('./db');
import { sendCommunityNotificationQueue } from 'shared/bull/queues';
import type { DBUsersCommunities } from 'shared/types';
import { events } from 'shared/analytics';
import { trackQueue } from 'shared/bull/queues';

/*
===========================================================

        MODIFYING AND CREATING DATA IN USERSCOMMUNITIES

===========================================================
*/

// invoked only when a new community is being created. the user who is doing
// the creation is automatically an owner and a member
// prettier-ignore
const createOwnerInCommunity = (communityId: string, userId: string): Promise<Object> => {
  return db
    .table('usersCommunities')
    .insert(
      {
        communityId,
        userId,
        createdAt: new Date(),
        isOwner: true,
        isMember: true,
        isModerator: false,
        isBlocked: false,
        receiveNotifications: true,
        reputation: 0,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => {
      trackQueue.add({
        userId,
        event: events.USER_WAS_ADDED_AS_OWNER_IN_COMMUNITY,
        context: { communityId }
      })
      return result.changes[0].new_val
    });
};

// creates a single member in a community. invoked when a user joins a public
// community
// prettier-ignore
const createMemberInCommunity = (communityId: string, userId: string): Promise<Object> => {

  trackQueue.add({
    userId,
    event: events.USER_JOINED_COMMUNITY,
    context: { communityId }
  })

  return db
    .table('usersCommunities')
    .getAll(userId, { index: 'userId' })
    .filter({ communityId })
    .run()
    .then(result => {
      if (result && result.length > 0) {
        // if the result exists, it means the user has a previous relationship
        // with this community - since we already handled 'blocked' logic
        // in the mutation controller, we can simply update the user record
        // to be a re-joined member with notifications turned on

        return db
          .table('usersCommunities')
          .getAll(userId, { index: 'userId' })
          .filter({ communityId })
          .update(
            {
              createdAt: new Date(),
              isMember: true,
              receiveNotifications: true,
            },
            { returnChanges: 'always' }
          )
          .run();
      } else {
        // if no relationship exists, we can create a new one from scratch
        return db
          .table('usersCommunities')
          .insert(
            {
              communityId,
              userId,
              createdAt: new Date(),
              isMember: true,
              isOwner: false,
              isModerator: false,
              isBlocked: false,
              receiveNotifications: true,
              reputation: 0,
            },
            { returnChanges: true }
          )
          .run();
      }
    })
    .then(result => {
      sendCommunityNotificationQueue.add({ communityId, userId });
      return result.changes[0].new_val;
    });
};

// removes a single member from a community. will be invoked if a user leaves a community
// prettier-ignore
const removeMemberInCommunity = (communityId: string, userId: string): Promise<Object> => {

  trackQueue.add({
    userId,
    event: events.USER_LEFT_COMMUNITY,
    context: { communityId }
  })

  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ userId })
    .update({
      isModerator: false,
      isMember: false,
      receiveNotifications: false,
    })
    .run()
    .then(() =>
      db
        .table('communities')
        .get(communityId)
        .run()
    );
};

// removes all the user relationships to a community. will be invoked when a
// community is deleted, at which point we don't want any records in the
// database to show a user relationship to the deleted community
// prettier-ignore
const removeMembersInCommunity = async (communityId: string): Promise<?Object> => {

  const usersCommunities = await db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .run()

  if (!usersCommunities || usersCommunities.length === 0) return

  const trackingPromises = usersCommunities.map(usersCommunity => {
    return trackQueue.add({
      userId: usersCommunity.userId,
      event: events.USER_LEFT_COMMUNITY,
      context: { communityId }
    })
  })

  const leavePromise = await db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .update({
      isMember: false,
      receiveNotifications: false,
    })
    .run();

  return Promise.all([
    ...trackingPromises,
    leavePromise
  ])
};

// toggles user to blocked in a community. invoked by a community or community
// owner when managing a private community. sets pending to false to handle
// private communitys modifying pending users to be blocked
// prettier-ignore
const blockUserInCommunity = (communityId: string, userId: string): Promise<DBUsersCommunities> => {
  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ userId })
    .update(
      {
        isMember: false,
        isPending: false,
        isBlocked: true,
        isModerator: false,
        receiveNotifications: false,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => {
      trackQueue.add({
        userId,
        event: events.USER_WAS_BLOCKED_IN_COMMUNITY,
        context : { communityId }
      })
      return result.changes[0].new_val
    });
};

// unblocks a blocked user in a community. invoked by a community or community
// owner when managing a private community. this *does* add the user
// as a member
// prettier-ignore
const unblockUserInCommunity = (communityId: string, userId: string): Promise<DBUsersCommunities> => {
  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ userId, isBlocked: true })
    .update(
      {
        isModerator: false,
        isMember: true,
        isBlocked: false,
        receiveNotifications: true,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => {

      trackQueue.add({
        userId,
        event: events.USER_WAS_UNBLOCKED_IN_COMMUNITY,
        context: { communityId }
      })

      return result.changes[0].new_val
    });
};

// moves an *existing* user in a community to be a moderator
// prettier-ignore
const makeMemberModeratorInCommunity = (communityId: string, userId: string): Promise<DBUsersCommunities> => {
  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ userId })
    .update(
      {
        isBlocked: false,
        isMember: true,
        isModerator: true,
        receiveNotifications: true,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => {

      trackQueue.add({
        userId,
        event: events.USER_WAS_ADDED_AS_MODERATOR_IN_COMMUNITY,
        context: { communityId }
      })

      return result.changes[0].new_val
    });
};

// moves a moderator to be only a member in a community. does not remove them from the community
// prettier-ignore
const removeModeratorInCommunity = (communityId: string, userId: string): Promise<Object> => {
  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ userId })
    .update(
      {
        isModerator: false,
      },
      { returnChanges: true }
    )
    .run()
    .then(result => {

      trackQueue.add({
        userId,
        event: events.USER_WAS_REMOVED_AS_MODERATOR_IN_COMMUNITY,
        context: { communityId }
      })

      return result.changes[0].new_val
    });
};

// changes all moderators in a community to members
// prettier-ignore
const removeModeratorsInCommunity = async (communityId: string): Promise<?Object> => {
  const moderators = await db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ isModerator: true })
    .run()

  if (!moderators || moderators.length === 0) return

  const trackingPromises = moderators.map(moderator => {
    return trackQueue.add({
      userId: moderator.userId,
      event: events.USER_WAS_REMOVED_AS_MODERATOR_IN_COMMUNITY,
      context: { communityId }
    })
  })

  const removePromise = db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter({ isModerator: true })
    .update({ isModerator: false }, { returnChanges: true })
    .run();

  return Promise.all([
    ...trackingPromises,
    removePromise
  ])
};

const removeUsersCommunityMemberships = async (userId: string) => {
  const memberships = await db
    .table('usersCommunities')
    .getAll(userId, { index: 'userId' })
    .run();

  if (!memberships || memberships.length === 0) return;

  const trackingPromises = memberships.map(member => {
    return trackQueue.add({
      userId,
      event: events.USER_LEFT_COMMUNITY,
      context: { communityId: member.communityId },
    });
  });

  const removeMembershipsPromise = db
    .table('usersCommunities')
    .getAll(userId, { index: 'userId' })
    .update({
      isOwner: false,
      isModerator: false,
      isMember: false,
      receiveNotifications: false,
    })
    .run();

  return Promise.all([...trackingPromises, removeMembershipsPromise]);
};

/*
===========================================================

            GETTING DATA FROM USERSCOMMUNITIES

===========================================================
*/

type Options = { first: number, after: number };

// prettier-ignore
const getMembersInCommunity = (communityId: string, options: Options, filter: Object): Promise<Array<string>> => {
  const { first, after } = options
  return db
    .table('usersCommunities')
    .getAll(communityId, { index: 'communityId' })
    .filter(filter ? filter : { isMember: true })
    .orderBy(db.desc('reputation'))
    .skip(after || 0)
    .limit(first || 999999)
    // return an array of the userIds to be loaded by gql
    .map(userCommunity => userCommunity('userId'))
    .run()
};

// prettier-ignore
const getBlockedUsersInCommunity = (communityId: string): Promise<Array<string>> => {
  return (
    db
      .table('usersCommunities')
      .getAll(communityId, { index: 'communityId' })
      .filter({ isBlocked: true })
      // return an array of the userIds to be loaded by gql
      .map(userCommunity => userCommunity('userId'))
      .run()
  );
};

// prettier-ignore
const getModeratorsInCommunity = (communityId: string): Promise<Array<string>> => {
  return (
    db
      .table('usersCommunities')
      .getAll(communityId, { index: 'communityId' })
      .filter({ isModerator: true })
      // return an array of the userIds to be loaded by gql
      .map(userCommunity => userCommunity('userId'))
      .run()
  );
};

const getOwnersInCommunity = (communityId: string): Promise<Array<string>> => {
  return (
    db
      .table('usersCommunities')
      .getAll(communityId, { index: 'communityId' })
      .filter({ isOwner: true })
      // return an array of the userIds to be loaded by gql
      .map(userCommunity => userCommunity('userId'))
      .run()
  );
};

const DEFAULT_USER_COMMUNITY_PERMISSIONS = {
  isOwner: false,
  isMember: false,
  isModerator: false,
  isBlocked: false,
  receiveNotifications: false,
  reputation: 0,
};

// NOTE @BRIAN: DEPRECATED - DONT USE IN THE FUTURE
// prettier-ignore
const getUserPermissionsInCommunity = (communityId: string, userId: string): Promise<Object> => {
  return db
    .table('usersCommunities')
    .getAll([userId, communityId], {
      index: 'userIdAndCommunityId',
    })
    .run()
    .then(data => {
      // if a record exists
      if (data.length > 0) {
        return data[0];
      } else {
        // if a record doesn't exist, we're creating a new relationship
        // so default to false for everything
        return {
          ...DEFAULT_USER_COMMUNITY_PERMISSIONS,
          userId,
          communityId,
        };
      }
    });
};

// prettier-ignore
const checkUserPermissionsInCommunity = (communityId: string, userId: string): Promise<DBUsersCommunities> => {
  return db
    .table('usersCommunities')
    .getAll([userId, communityId], { index: 'userIdAndCommunityId' })
    .run();
};

type UserIdAndCommunityId = [string, string];

// prettier-ignore
const getUsersPermissionsInCommunities = (input: Array<UserIdAndCommunityId>) => {
  return db
    .table('usersCommunities')
    .getAll(...input, { index: 'userIdAndCommunityId' })
    .run()
    .then(data => {
      if (!data)
        return Array.from({ length: input.length }, (_, index) => ({
          ...DEFAULT_USER_COMMUNITY_PERMISSIONS,
          userId: input[index][0],
          communityId: input[index][1],
        }));

      return data.map(
        (rec, index) =>
          rec
            ? rec
            : {
                ...DEFAULT_USER_COMMUNITY_PERMISSIONS,
                userId: input[index][0],
                communityId: input[index][1],
              }
      );
    });
};

const getReputationByUser = (userId: string): Promise<Number> => {
  return db
    .table('usersCommunities')
    .getAll(userId, { index: 'userId' })
    .filter({ isMember: true })
    .map(rec => rec('reputation'))
    .reduce((l, r) => l.add(r))
    .default(0)
    .run();
};

// prettier-ignore
const getUsersTotalReputation = (userIds: Array<string>): Promise<Array<number>> => {
  return db
    .table('usersCommunities')
    .getAll(...userIds, { index: 'userId' })
    .filter({ isMember: true })
    .group('userId')
    .map(rec => rec('reputation'))
    .reduce((l, r) => l.add(r))
    .default(0)
    .run()
    .then(res =>
      res.map(
        res =>
          res && {
            reputation: res.reduction,
            userId: res.group,
          }
      )
    );
};

module.exports = {
  // modify and create
  createOwnerInCommunity,
  createMemberInCommunity,
  removeMemberInCommunity,
  removeMembersInCommunity,
  blockUserInCommunity,
  unblockUserInCommunity,
  makeMemberModeratorInCommunity,
  removeModeratorInCommunity,
  removeModeratorsInCommunity,
  removeUsersCommunityMemberships,
  // get
  DEFAULT_USER_COMMUNITY_PERMISSIONS,
  getMembersInCommunity,
  getBlockedUsersInCommunity,
  getModeratorsInCommunity,
  getOwnersInCommunity,
  getUserPermissionsInCommunity,
  checkUserPermissionsInCommunity,
  getReputationByUser,
  getUsersTotalReputation,
  getUsersPermissionsInCommunities,
};
