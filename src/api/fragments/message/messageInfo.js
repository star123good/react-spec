// @flow
// $FlowFixMe
import { gql } from 'react-apollo';
import { userInfoFragment } from '../user/userInfo';
import { reactionInfoFragment } from '../reaction/reactionInfo';

export const messageInfoFragment = gql`
  fragment messageInfo on Message {
    id
    timestamp
    messageType
    sender {
      ...userInfo
    }
    reactions {
      ...reactionInfo
    }
    content {
      body
    }
  }
  ${userInfoFragment}
  ${reactionInfoFragment}
`;
