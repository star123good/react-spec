// @flow
import gql from 'graphql-tag';
import threadInfoFragment from '../thread/threadInfo';

export default gql`
  fragment channelThreadConnection on Channel {
    threadConnection(first: 10, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          ...threadInfo
        }
      }
    }
  }
  ${threadInfoFragment}
`;
