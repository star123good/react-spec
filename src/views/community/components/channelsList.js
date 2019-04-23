// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Link } from 'react-router-dom';
import compose from 'recompose/compose';
import type { Dispatch } from 'redux';
import { ErrorBoundary } from 'src/components/error';
import Icon from 'src/components/icon';
import { Loading } from 'src/components/loading';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import getCommunityChannels from 'shared/graphql/queries/community/getCommunityChannelConnection';
import type { GetCommunityChannelConnectionType } from 'shared/graphql/queries/community/getCommunityChannelConnection';
import { withCurrentUser } from 'src/components/withCurrentUser';
import Tooltip from 'src/components/tooltip';
import { ChannelListItem } from 'src/components/entities';
import { WhiteIconButton } from 'src/components/button';
import { SidebarSectionHeader, SidebarSectionHeading, List } from '../style';
import {
  Row,
  Content,
  Label,
  Description,
} from 'src/components/entities/listItems/style';

type Props = {
  data: {
    community: GetCommunityChannelConnectionType,
  },
  isLoading: boolean,
  dispatch: Dispatch<Object>,
  currentUser: Object,
  communitySlug: string,
};

class Component extends React.Component<Props> {
  sortChannels = (array: Array<any>): Array<?any> => {
    if (!array || array.length === 0) return [];

    const generalChannel = array.find(channel => channel.slug === 'general');
    const withoutGeneral = array.filter(channel => channel.slug !== 'general');
    const sortedWithoutGeneral = withoutGeneral.sort((a, b) => {
      if (a.slug < b.slug) return -1;
      if (a.slug > b.slug) return 1;
      return 0;
    });
    if (generalChannel) {
      sortedWithoutGeneral.unshift(generalChannel);
      return sortedWithoutGeneral;
    } else {
      return sortedWithoutGeneral;
    }
  };
  render() {
    const {
      isLoading,
      data: { community },
    } = this.props;

    if (isLoading) {
      return (
        <React.Fragment>
          <SidebarSectionHeader>
            <SidebarSectionHeading>Channels</SidebarSectionHeading>
          </SidebarSectionHeader>
          <Loading style={{ padding: '32px' }} />
        </React.Fragment>
      );
    }

    if (community && community.channelConnection) {
      const { isOwner } = community.communityPermissions;
      const channels = community.channelConnection.edges
        .map(channel => channel && channel.node)
        .filter(channel => {
          if (!channel) return null;
          if (channel.isArchived) return null;
          if (channel.isPrivate && !channel.channelPermissions.isMember)
            return null;

          return channel;
        })
        .filter(channel => channel && !channel.channelPermissions.isBlocked);

      const sortedChannels = this.sortChannels(channels);

      return (
        <React.Fragment>
          <SidebarSectionHeader>
            <SidebarSectionHeading>Channels</SidebarSectionHeading>
            {isOwner && (
              <Tooltip content={'Manage channels'}>
                <span>
                  <WhiteIconButton to={`/${community.slug}/settings`}>
                    <Icon glyph={'settings'} size={24} />
                  </WhiteIconButton>
                </span>
              </Tooltip>
            )}
          </SidebarSectionHeader>

          <List data-cy="channel-list">
            <Route exact path={`/${community.slug}`}>
              {({ match }) => (
                <Link to={`/${community.slug}?tab=posts`}>
                  <Row
                    isActive={
                      !!match && location.search.indexOf('tab=posts') > -1
                    }
                  >
                    <Content>
                      <Tooltip content="See the posts of all channels you are a member of">
                        <Label>All</Label>
                      </Tooltip>
                    </Content>
                  </Row>
                </Link>
              )}
            </Route>
            <Route exact path={`/${community.slug}`}>
              {({ match }) => (
                <Link to={`/${community.slug}?tab=chat`}>
                  <Row
                    isActive={
                      !!match && location.search.indexOf('tab=chat') > -1
                    }
                  >
                    <Content>
                      <Label>Chat</Label>
                    </Content>
                  </Row>
                </Link>
              )}
            </Route>
            {sortedChannels.map(channel => {
              if (!channel) return null;
              return (
                <ErrorBoundary key={channel.id}>
                  <Route path={`/${channel.community.slug}/${channel.slug}`}>
                    {({ match }) => (
                      <ChannelListItem
                        channel={channel}
                        name={channel.name}
                        isActive={!!match}
                      />
                    )}
                  </Route>
                </ErrorBoundary>
              );
            })}
          </List>
        </React.Fragment>
      );
    }

    return null;
  }
}

export const ChannelsList = compose(
  getCommunityChannels,
  viewNetworkHandler,
  withCurrentUser,
  connect()
)(Component);
