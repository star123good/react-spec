//@flow
const { db } = require('./db');

// prettier-ignore
export const getPublicChannelIdsInCommunity = (communityId: string): Promise<Array<string>> => {
  return db
    .table('channels')
    .getAll(communityId, { index: 'communityId' })
    .filter(row =>
      row
        .hasFields('deletedAt')
        .not()
        .and(row('isPrivate').eq(false))
    )
    .map(row => row('id'))
    .run();
};

// prettier-ignore
export const getPrivateChannelIdsInCommunity = (communityId: string): Promise<Array<string>> => {
  return db
    .table('channels')
    .getAll(communityId, { index: 'communityId' })
    .filter(row =>
      row
        .hasFields('deletedAt')
        .not()
        .and(row('isPrivate').eq(true))
    )
    .map(row => row('id'))
    .run();
};

// prettier-ignore
export const getPublicChannelIdsForUsersThreads = (userId: string): Promise<Array<string>> => {
  return db
    .table('threads')
    .getAll(userId, { index: 'creatorId' })
    .filter(row => row.hasFields('deletedAt').not())
    .eqJoin('channelId', db.table('channels'))
    .filter(row => row('right')('isPrivate').eq(false))
    .zip()
    .map(row => row('channelId'))
    .run();
};

// prettier-ignore
export const getPrivateChannelIdsForUsersThreads = (userId: string): Promise<Array<string>> => {
  return db
    .table('threads')
    .getAll(userId, { index: 'creatorId' })
    .filter(row => row.hasFields('deletedAt').not())
    .eqJoin('channelId', db.table('channels'))
    .filter(row => row('right')('isPrivate').eq(true))
    .zip()
    .map(row => row('channelId'))
    .run();
};

// prettier-ignore
export const getUsersJoinedChannels = (userId: string): Promise<Array<string>> => {
  return db
    .table('usersChannels')
    .getAll(userId, { index: 'userId' })
    .filter({ isMember: true })
    .map(row => row('channelId'))
    .run();
};

// prettier-ignore
export const getUsersJoinedPrivateChannelIds = (userId: string): Promise<Array<string>> => {
  return db
    .table('usersChannels')
    .getAll(userId, { index: 'userId' })
    .filter({ isMember: true })
    .eqJoin('channelId', db.table('channels'))
    .filter(row => row('right')('isPrivate').eq(true))
    .without({ left: ['id'] })
    .zip()
    .map(row => row('id'))
    .run();
};
