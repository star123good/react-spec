// @flow
import type { DBCommunity } from 'shared/types';
import type { GraphQLContext } from '../../';
import UserError from '../../utils/UserError';
const {
  getMemberCount,
  getCommunityGrowth,
} = require('../../models/community');

export default async (
  { id, memberCount }: DBCommunity,
  _: any,
  { user, loaders }: GraphQLContext
) => {
  const currentUser = user;

  if (!currentUser) {
    return new UserError('You must be signed in to continue.');
  }

  const { isOwner } = await loaders.userPermissionsInCommunity.load([
    currentUser.id,
    id,
  ]);

  if (!isOwner) {
    return new UserError(
      'You must be the owner of this community to view analytics.'
    );
  }

  return {
    count: memberCount || 1,
    weeklyGrowth: await getCommunityGrowth(
      'usersCommunities',
      'weekly',
      'createdAt',
      id,
      {
        isMember: true,
      }
    ),
    monthlyGrowth: await getCommunityGrowth(
      'usersCommunities',
      'monthly',
      'createdAt',
      id,
      {
        isMember: true,
      }
    ),
    quarterlyGrowth: await getCommunityGrowth(
      'usersCommunities',
      'quarterly',
      'createdAt',
      id,
      {
        isMember: true,
      }
    ),
  };
};
