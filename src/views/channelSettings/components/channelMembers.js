//@flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Loading } from 'src/components/loading';
import getChannelMembersQuery from 'shared/graphql/queries/channel/getChannelMemberConnection';
import type { GetChannelMemberConnectionType } from 'shared/graphql/queries/channel/getChannelMemberConnection';
import { FetchMoreButton } from 'src/components/threadFeed/style';
import ViewError from 'src/components/viewError';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import { UserListItem } from 'src/components/Entities';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import { UserListItemContainer } from '../style';
import { ListContainer, ListFooter } from 'src/components/listItems/style';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  data: {
    channel: GetChannelMemberConnectionType,
    fetchMore: Function,
  },
  isLoading: boolean,
  isFetchingMore: boolean,
  dispatch: Dispatch<Object>,
  currentUser: ?Object,
};

class ChannelMembers extends Component<Props> {
  render() {
    const {
      data: { channel, fetchMore },
      data,
      isLoading,
      isFetchingMore,
      currentUser,
    } = this.props;

    if (data && data.channel) {
      const members =
        channel.memberConnection &&
        channel.memberConnection.edges.map(member => member && member.node);
      const totalCount =
        channel.metaData && channel.metaData.members.toLocaleString();

      return (
        <SectionCard>
          <SectionTitle>
            {totalCount === 1
              ? `${totalCount} member`
              : `${totalCount} members`}
          </SectionTitle>

          <ListContainer>
            {members &&
              members.map(user => {
                if (!user) return null;
                return (
                  <UserListItemContainer key={user.id}>
                    <UserListItem
                      userObject={user}
                      id={user.id}
                      name={user.name}
                      username={user.username}
                      isCurrentUser={currentUser && user.id === currentUser.id}
                      isOnline={user.isOnline}
                      profilePhoto={user.profilePhoto}
                      avatarSize={40}
                      description={user.description}
                      showHoverProfile={false}
                      messageButton={true}
                    />
                  </UserListItemContainer>
                );
              })}
          </ListContainer>

          {channel.memberConnection &&
            channel.memberConnection.pageInfo.hasNextPage && (
              <ListFooter>
                <FetchMoreButton
                  color={'brand.default'}
                  loading={isFetchingMore}
                  onClick={() => fetchMore()}
                >
                  Load more
                </FetchMoreButton>
              </ListFooter>
            )}
        </SectionCard>
      );
    }

    if (isLoading) {
      return (
        <SectionCard>
          <Loading />
        </SectionCard>
      );
    }

    return (
      <SectionCard>
        <ViewError />
      </SectionCard>
    );
  }
}

export default compose(
  getChannelMembersQuery,
  withCurrentUser,
  viewNetworkHandler,
  connect()
)(ChannelMembers);
