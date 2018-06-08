// @flow
import React, { Component } from 'react';
import { Text, View, StatusBar } from 'react-native';
import compose from 'recompose/compose';
import { withNavigation } from 'react-navigation';
import {
  getCommunityById,
  type GetCommunityType,
} from '../../../shared/graphql/queries/community/getCommunity';
import getCommunityThreads from '../../../shared/graphql/queries/community/getCommunityThreadConnection';
import ViewNetworkHandler from '../../components/ViewNetworkHandler';
import ThreadFeed from '../../components/ThreadFeed';
import { ThreadListItem } from '../../components/Lists';
import { getThreadById } from '../../../shared/graphql/queries/thread/getThread';
import Loading from '../../components/Loading';

import {
  Wrapper,
  CoverPhoto,
  CoverPhotoFill,
  CoverPhotoContainer,
  ProfilePhoto,
  ProfilePhotoContainer,
  ProfileDetailsContainer,
  Name,
  Description,
  ThreadFeedDivider,
} from './style';
import ErrorBoundary from '../../components/ErrorBoundary';

type Props = {
  isLoading: boolean,
  hasError: boolean,
  navigation: Object,
  data: {
    community?: GetCommunityType,
  },
};

const RemoteThreadItem = compose(getThreadById, withNavigation)(
  ({ data, navigation }) => {
    if (data.loading) return <Loading />;
    if (!data.thread) return null;
    return (
      <ThreadListItem
        activeCommunity={data.thread.community.id}
        thread={data.thread}
        onPressHandler={() =>
          navigation.navigate({
            routeName: `Thread`,
            key: data.thread.id,
            params: { id: data.thread.id },
          })
        }
      />
    );
  }
);

const CommunityThreadFeed = compose(getCommunityThreads)(ThreadFeed);

class Community extends Component<Props> {
  render() {
    const { data: { community }, isLoading, hasError, navigation } = this.props;

    if (community) {
      return (
        <Wrapper>
          <StatusBar barStyle="light-content" />

          <CommunityThreadFeed
            navigation={navigation}
            id={community.id}
            activeCommunity={community.id}
            ListHeaderComponent={
              <ErrorBoundary fallbackComponent={null}>
                <CoverPhotoContainer>
                  {community.coverPhoto ? (
                    <CoverPhoto
                      resizeMode={'cover'}
                      source={{ uri: community.coverPhoto }}
                    />
                  ) : (
                    <CoverPhotoFill />
                  )}
                </CoverPhotoContainer>

                <ProfilePhotoContainer>
                  <ProfilePhoto source={{ uri: community.profilePhoto }} />
                </ProfilePhotoContainer>

                <ProfileDetailsContainer>
                  <Name>{community.name}</Name>
                  <Description>{community.description}</Description>
                </ProfileDetailsContainer>

                <ThreadFeedDivider />

                {community.pinnedThreadId && (
                  <RemoteThreadItem
                    id={community.pinnedThreadId}
                    activeCommunity={community.id}
                  />
                )}
                {community.watercoolerId && (
                  <RemoteThreadItem
                    id={community.watercoolerId}
                    activeCommunity={community.id}
                  />
                )}
              </ErrorBoundary>
            }
          />
        </Wrapper>
      );
    }

    if (isLoading) {
      return (
        <Wrapper>
          <Loading />
        </Wrapper>
      );
    }

    if (hasError) {
      return (
        <Wrapper>
          <View testID="e2e-community">
            <Text>Error!</Text>
          </View>
        </Wrapper>
      );
    }

    return null;
  }
}

export default compose(getCommunityById, ViewNetworkHandler)(Community);
