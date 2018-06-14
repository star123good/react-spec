// @flow
import React, { Component } from 'react';
import compose from 'recompose/compose';
import {
  getChannelById,
  type GetChannelType,
} from '../../../shared/graphql/queries/channel/getChannel';
import getChannelThreadConnection from '../../../shared/graphql/queries/channel/getChannelThreadConnection';
import ViewNetworkHandler from '../../components/ViewNetworkHandler';
import ThreadFeed from '../../components/ThreadFeed';
import Loading from '../../components/Loading';
import JoinButton from './JoinButton';
import { track, transformations, events } from '../../utils/analytics';

import {
  Wrapper,
  CoverPhoto,
  CoverPhotoFill,
  CoverPhotoContainer,
  ProfilePhoto,
  ProfilePhotoContainer,
  ProfileDetailsContainer,
  Name,
  Username,
  Description,
  ThreadFeedDivider,
} from './style';
import ErrorBoundary from '../../components/ErrorBoundary';
import { FullscreenNullState } from '../../components/NullStates';
import type { NavigationProps } from 'react-navigation';

type Props = {
  isLoading: boolean,
  hasError: boolean,
  navigation: NavigationProps,
  data: {
    channel?: GetChannelType,
  },
};

const ChannelThreadFeed = compose(getChannelThreadConnection)(ThreadFeed);

class Channel extends Component<Props> {
  trackView = () => {
    const { data: { channel } } = this.props;
    if (!channel) return;
    track(events.CHANNEL_VIEWED, {
      channel: transformations.analyticsChannel(channel),
      community: transformations.analyticsCommunity(channel.community),
    });
  };

  setTitle = () => {
    const { data: { channel }, navigation } = this.props;
    let title;
    if (channel) {
      title = channel.name;
    } else {
      title = 'Loading channel...';
    }
    const oldTitle = navigation.getParam('title', null);
    if (oldTitle && oldTitle === title) return;
    navigation.setParams({ title });
  };

  componentDidMount() {
    this.trackView();
    this.setTitle();
  }

  componentDidUpdate(prev) {
    const curr = this.props;
    const first = !prev.data.channel && curr.data.channel;
    const changed =
      prev.data.channel &&
      curr.data.channel &&
      prev.data.channel.id !== curr.data.channel.id;
    if (first || changed) {
      this.trackView();
    }

    this.setTitle();
  }

  render() {
    const { data, isLoading, hasError, navigation } = this.props;

    if (data.channel) {
      const { channel } = data;

      return (
        <Wrapper>
          <ChannelThreadFeed
            navigation={navigation}
            id={channel.id}
            activeChannel={channel.id}
            activeCommunity={channel.community.id}
            ListHeaderComponent={
              <ErrorBoundary alert>
                <CoverPhotoContainer>
                  {channel.community.coverPhoto ? (
                    <CoverPhoto
                      resizeMode={'cover'}
                      source={{ uri: channel.community.coverPhoto }}
                    />
                  ) : (
                    <CoverPhotoFill />
                  )}
                </CoverPhotoContainer>

                <ProfilePhotoContainer>
                  <ProfilePhoto
                    source={{ uri: channel.community.profilePhoto }}
                  />
                </ProfilePhotoContainer>

                <ProfileDetailsContainer>
                  <Username>{channel.community.name}</Username>
                  <Name>{channel.name}</Name>
                  <Description>{channel.description}</Description>
                  <JoinButton channel={channel} />
                </ProfileDetailsContainer>

                <ThreadFeedDivider />
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
      return <FullscreenNullState />;
    }

    return null;
  }
}

export default compose(getChannelById, ViewNetworkHandler)(Channel);
