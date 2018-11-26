// @flow
import type { DBCommunity } from 'shared/types';
import { signImageUrl } from 'shared/imgix';

export const signCommunity = (
  community: DBCommunity,
  expires: number
): DBCommunity => {
  const { profilePhoto, coverPhoto, ...rest } = community;

  return {
    ...rest,
    profilePhoto: signImageUrl(profilePhoto, {
      w: 256,
      h: 256,
      expires,
    }),
    coverPhoto: signImageUrl(coverPhoto, {
      w: 1280,
      h: 384,
      expires,
    }),
  };
};
