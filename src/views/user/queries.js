// @flow
import { graphql, gql } from 'react-apollo';
import userInfoFragment from 'shared/graphql/fragments/user/userInfo';
import userThreadConnectionFragment from 'shared/graphql/fragments/user/userThreadConnection';
import userCommunityConnectionFragment from 'shared/graphql/fragments/user/userCommunityConnection';
import { subscribeToUpdatedThreads } from 'shared/graphql/subscriptions';
import { parseRealtimeThreads } from 'shared/graphql/subscriptions/utils';

const LoadMoreThreads = gql`
  query loadMoreUserThreads(
    $username: String
    $after: String
    $kind: ThreadConnectionType
  ) {
    user(username: $username) {
      ...userInfo
      ...userThreadConnection
    }
  }
  ${userInfoFragment}
  ${userThreadConnectionFragment}
`;

const threadsQueryOptions = {
  props: ({
    ownProps,
    data: { fetchMore, error, loading, networkStatus, user, subscribeToMore },
  }) => ({
    data: {
      error,
      loading,
      user,
      networkStatus,
      threads: user ? user.threadConnection.edges : '',
      hasNextPage: user ? user.threadConnection.pageInfo.hasNextPage : false,
      subscribeToUpdatedThreads: () => {
        return subscribeToMore({
          document: subscribeToUpdatedThreads,
          updateQuery: (prev, { subscriptionData }) => {
            const updatedThread = subscriptionData.data.threadUpdated;
            if (!updatedThread) return prev;

            const thisUserId = ownProps.userId;
            const updatedThreadShouldAppearInContext =
              thisUserId === updatedThread.creator.id;

            const newThreads = updatedThreadShouldAppearInContext
              ? parseRealtimeThreads(
                  prev.user.threadConnection.edges,
                  updatedThread,
                  ownProps.dispatch
                ).filter(thread => thread.node.creator.id === thisUserId)
              : [...prev.user.threadConnection.edges];

            return {
              ...prev,
              user: {
                ...prev.user,
                threadConnection: {
                  ...prev.user.threadConnection,
                  pageInfo: {
                    ...prev.user.threadConnection.pageInfo,
                  },
                  edges: newThreads,
                },
              },
            };
          },
        });
      },
      fetchMore: () =>
        fetchMore({
          query: LoadMoreThreads,
          variables: {
            after:
              user.threadConnection.edges[
                user.threadConnection.edges.length - 1
              ].cursor,
            username: user.username,
            kind: ownProps.kind,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult.user) {
              return prev;
            }
            return {
              ...prev,
              user: {
                ...prev.user,
                threadConnection: {
                  ...prev.user.threadConnection,
                  pageInfo: {
                    ...prev.user.threadConnection.pageInfo,
                    ...fetchMoreResult.user.threadConnection.pageInfo,
                  },
                  edges: [
                    ...prev.user.threadConnection.edges,
                    ...fetchMoreResult.user.threadConnection.edges,
                  ],
                },
              },
            };
          },
        }),
    },
  }),
  options: ({ username, kind }) => ({
    variables: {
      username,
      kind,
    },
    fetchPolicy: 'cache-first',
  }),
};

export const getUserThreads = graphql(
  gql`
    query getUserThreads(
      $username: String
      $after: String
      $kind: ThreadConnectionType
    ) {
      user(username: $username) {
        ...userInfo
        ...userThreadConnection
      }
    }
    ${userInfoFragment}
    ${userThreadConnectionFragment}
  `,
  threadsQueryOptions
);

/*
  Loads the sidebar profile component widget independent of the thread feed.
  In the future we can compose these queries together since they are fetching
  such similar data, but for now we're making a decision to keep the data
  queries specific to each component.
*/
const profileQueryOptions = {
  options: ({ match: { params: { username } } }) => ({
    variables: {
      username: username,
    },
    fetchPolicy: 'cache-first',
  }),
};

export const getUser = graphql(
  gql`
    query getUser($username: String) {
      user(username: $username) {
        ...userInfo
        isPro
        totalReputation
        ...userCommunityConnection
      }
    }
    ${userInfoFragment}
    ${userCommunityConnectionFragment}
  `,
  profileQueryOptions
);
