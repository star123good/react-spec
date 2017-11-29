//@flow
// $FlowFixMe
import { graphql, gql } from 'react-apollo';
import { communityInfoFragment } from '../../api/fragments/community/communityInfo';

export const getCommunity = graphql(
  gql`
		query getCommunity($slug: String) {
			community(slug: $slug) {
        ...communityInfo
      }
		}
    ${communityInfoFragment}
	`,
  {
    props: ({ data: { error, loading, community } }) => ({
      data: {
        error,
        loading,
        community,
      },
    }),
  }
);

/*
  Gets top communities for the onboarding flow.
*/
export const getTopCommunities = graphql(
  gql`
		{
		  topCommunities {
        ...communityInfo
        metaData {
          members
        }
      }
    }
    ${communityInfoFragment}
	`,
  {
    props: ({ data: { error, loading, topCommunities } }) => ({
      data: {
        error,
        loading,
        topCommunities,
      },
    }),
  }
);

export const getRecentCommunities = graphql(
  gql`
		{
		  recentCommunities {
        ...communityInfo
        metaData {
          members
        }
      }
    }
    ${communityInfoFragment}
	`,
  {
    props: ({ data: { error, loading, recentCommunities } }) => ({
      data: {
        error,
        loading,
        recentCommunities,
      },
    }),
  }
);

const GET_COMMUNITIES_OPTIONS = {
  options: ({ curatedContentType }) => ({
    variables: {
      curatedContentType,
    },
    fetchPolicy: 'cache-and-network',
  }),
};

const GET_COMMUNITIES_QUERY = gql`
  query getCommunitiesCollection($curatedContentType: String) {
    communities(curatedContentType: $curatedContentType) {
      ...communityInfo
      metaData {
        members
      }
    }
  }
  ${communityInfoFragment}
`;

export const getCommunitiesCollectionQuery = graphql(
  GET_COMMUNITIES_QUERY,
  GET_COMMUNITIES_OPTIONS
);
