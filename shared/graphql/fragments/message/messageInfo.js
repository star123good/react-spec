// @flow
import gql from 'graphql-tag';
import threadParticipantFragment from '../thread/threadParticipant';
import type { ThreadParticipantType } from '../thread/threadParticipant';

export type MessageInfoType = {
  id: string,
  timestamp: Date,
  messageType: string,
  sender: {
    ...$Exact<ThreadParticipantType>,
  },
  reactions: {
    count: number,
    hasReacted: boolean,
  },
  content: {
    body: string,
  },
};

export default gql`
  fragment messageInfo on Message {
    id
    timestamp
    messageType
    sender {
      ...threadParticipant
    }
    reactions {
      count
      hasReacted
    }
    content {
      body
    }
  }
  ${threadParticipantFragment}
`;
