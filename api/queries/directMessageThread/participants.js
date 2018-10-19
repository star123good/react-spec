// @flow
import type { GraphQLContext } from '../../';
import { canViewDMThread } from '../../utils/permissions';

export default async (
  { id }: { id: string },
  _: any,
  { loaders, user }: GraphQLContext
) => {
  if (!user || !user.id) return null;

  const canViewThread = await canViewDMThread(user.id, id, loaders);

  if (!canViewThread) return null;

  return loaders.directMessageParticipants.load(id).then(results => {
    if (!results || results.length === 0) return null;
    return results.reduction;
  });
};
