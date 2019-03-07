// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import compose from 'recompose/compose';
import { withRouter } from 'react-router-dom';
import Icon from 'src/components/icons';
import Tooltip from 'src/components/Tooltip';
import { isDesktopApp } from 'src/helpers/desktop-app-utils';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import { updateNotificationsCount } from 'src/actions/notifications';
import getUnreadDMQuery from 'shared/graphql/queries/notification/getDirectMessageNotifications';
import markDirectMessageNotificationsSeenMutation from 'shared/graphql/mutations/notification/markDirectMessageNotificationsSeen';
import { getAccessibilityActiveState } from './Accessibility';
import { NavigationContext } from 'src/routes';
import { AvatarGrid, AvatarLink, Label, IconWrapper, RedDot } from './style';
import { useConnectionRestored } from 'src/hooks/useConnectionRestored';

type State = {
  subscription: ?Function,
};

class DirectMessagesTab extends React.Component<Props, State> {
  state = {
    subscription: null,
  };

  componentDidMount() {
    this.subscribe();
    return this.setCount(this.props);
  }

  componentDidUpdate(prev: Props) {
    const { data: prevData } = prev;
    const curr = this.props;

    const didReconnect = useConnectionRestored({ curr, prev });
    if (didReconnect && curr.data.refetch) {
      curr.data.refetch();
    }

    // if the component updates for the first time
    if (
      !prevData.directMessageNotifications &&
      curr.data.directMessageNotifications
    ) {
      this.subscribe();
      return this.setCount(this.props);
    }

    // never update the badge if the user is viewing the messages tab
    // set the count to 0 if the tab is active so that if a user loads
    // /messages view directly, the badge won't update

    // if the user is viewing /messages, mark any incoming notifications
    // as seen, so that when they navigate away the message count won't shoot up
    if (this.props.active) {
      return this.markAllAsSeen();
    }

    if (
      curr.active &&
      curr.data.directMessageNotifications &&
      prevData.directMessageNotifications &&
      curr.data.directMessageNotifications.edges.length >
        prevData.directMessageNotifications.edges.length
    )
      return this.markAllAsSeen();

    // if the component updates with changed or new dm notifications
    // if any are unseen, set the counts
    if (
      curr.data.directMessageNotifications &&
      curr.data.directMessageNotifications.edges.length > 0 &&
      curr.data.directMessageNotifications.edges.some(
        n => n && n.node && !n.node.isSeen
      )
    ) {
      return this.setCount(this.props);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe = () => {
    this.setState({
      subscription: this.props.subscribeToDMs(),
    });
  };

  unsubscribe = () => {
    const { subscription } = this.state;
    if (subscription) {
      // This unsubscribes the subscription
      subscription();
    }
  };

  convertEdgesToNodes = notifications => {
    if (
      !notifications ||
      !notifications.edges ||
      notifications.edges.length === 0
    )
      return [];

    return notifications.edges.map(n => n && n.node);
  };

  setCount(props) {
    const {
      data: { directMessageNotifications },
    } = props;
    const { dispatch } = this.props;
    const nodes = this.convertEdgesToNodes(directMessageNotifications);
    // set to 0 if no notifications exist yet
    if (!nodes || nodes.length === 0) {
      return dispatch(
        updateNotificationsCount('directMessageNotifications', 0)
      );
    }

    // bundle dm notifications
    const obj = {};
    nodes
      .filter(n => n && !n.isSeen)
      .map(o => {
        if (!o) return null;
        if (obj[o.context.id]) return null;
        obj[o.context.id] = o;
        return null;
      });

    // count of unique notifications determined by the thread id
    const count = Object.keys(obj).length;
    return dispatch(
      updateNotificationsCount('directMessageNotifications', count)
    );
  }

  markAllAsSeen = () => {
    const {
      data: { directMessageNotifications },
      markDirectMessageNotificationsSeen,
      refetch,
      dispatch,
    } = this.props;

    const nodes = this.convertEdgesToNodes(directMessageNotifications);

    // force the count to 0
    dispatch(updateNotificationsCount('directMessageNotifications', 0));

    // if there are no unread, escape
    if (nodes && nodes.length === 0) return;

    // otherwise
    return markDirectMessageNotificationsSeen()
      .then(() => {
        // notifs were marked as seen
        // refetch to make sure we're keeping up with the server's state
        return refetch();
      })
      .then(() => this.setCount(this.props))
      .catch(err => {
        console.error('error marking dm notifications seen', err);
      });
  };

  render() {
    const { count, match } = this.props;

    // Keep the dock icon notification count indicator of the desktop app in sync
    if (isDesktopApp()) {
      window.interop.setBadgeCount(count);
    }

    return (
      <Route path="/messages">
        {({ match }) => (
          <NavigationContext.Consumer>
            {({ setNavigationIsOpen }) => (
              <Tooltip title="Messages">
                <AvatarGrid>
                  <AvatarLink
                    to={'/messages'}
                    data-cy="navbar-messages"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(
                      match.url === '/messages' && match.isExact
                    )}
                  >
                    <IconWrapper>
                      <Icon glyph="message-simple" />
                      {count > 0 && <RedDot style={{ right: '-3px' }} />}
                    </IconWrapper>

                    <Label>Messages</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>
            )}
          </NavigationContext.Consumer>
        )}
      </Route>
    );
  }
}

const map = state => ({
  count: state.notifications.directMessageNotifications,
  networkOnline: state.connectionStatus.networkOnline,
  websocketConnection: state.connectionStatus.websocketConnection,
});

export default compose(
  // $FlowIssue
  connect(map),
  getUnreadDMQuery,
  markDirectMessageNotificationsSeenMutation,
  viewNetworkHandler,
  withRouter
)(DirectMessagesTab);
