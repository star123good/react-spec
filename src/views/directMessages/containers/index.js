// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import Link from 'src/components/link';
import { connect } from 'react-redux';
import getCurrentUserDirectMessageThreads from 'shared/graphql/queries/directMessageThread/getCurrentUserDMThreadConnection';
import type { GetCurrentUserDMThreadConnectionType } from 'shared/graphql/queries/directMessageThread/getCurrentUserDMThreadConnection';
import markDirectMessageNotificationsSeenMutation from 'shared/graphql/mutations/notification/markDirectMessageNotificationsSeen';
import Icon from 'src/components/icons';
import ThreadsList from '../components/threadsList';
import NewThread from './newThread';
import ExistingThread from './existingThread';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import ViewError from 'src/components/viewError';
import Titlebar from '../../titlebar';
import { View, MessagesList, ComposeHeader } from '../style';
import { track, events } from 'src/helpers/analytics';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { useConnectionRestored } from 'src/hooks/useConnectionRestored';
import type {
  WebsocketConnectionType,
  PageVisibilityType,
} from 'src/reducers/connectionStatus';

type Props = {
  subscribeToUpdatedDirectMessageThreads: Function,
  markDirectMessageNotificationsSeen: Function,
  dispatch: Dispatch<Object>,
  match: Object,
  currentUser?: Object,
  hasError: boolean,
  isFetchingMore: boolean,
  isLoading: boolean,
  fetchMore: Function,
  data: {
    user: GetCurrentUserDMThreadConnectionType,
    refetch: Function,
  },
  networkOnline: boolean,
  websocketConnection: WebsocketConnectionType,
  pageVisibility: PageVisibilityType,
};

type State = {
  activeThread: string,
  subscription: ?Function,
};

class DirectMessages extends React.Component<Props, State> {
  constructor() {
    super();

    this.state = {
      activeThread: '',
      subscription: null,
    };
  }

  subscribe = () => {
    this.setState({
      subscription: this.props.subscribeToUpdatedDirectMessageThreads(),
    });
  };

  unsubscribe = () => {
    const { subscription } = this.state;
    if (subscription) {
      // This unsubscribes the subscription
      subscription();
    }
  };

  shouldComponentUpdate(nextProps: Props) {
    const curr = this.props;

    // fetching more
    if (curr.data.networkStatus === 7 && nextProps.data.networkStatus === 3)
      return false;

    return true;
  }

  componentDidUpdate(prev: Props) {
    const curr = this.props;

    const didReconnect = useConnectionRestored({ curr, prev });
    if (didReconnect && curr.data.refetch) {
      curr.data.refetch();
    }
  }

  componentDidMount() {
    this.props.markDirectMessageNotificationsSeen();
    this.subscribe();
    track(events.DIRECT_MESSAGES_VIEWED);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  setActiveThread = id => {
    if (id === 'new') {
      track(events.DIRECT_MESSAGE_THREAD_COMPOSER_VIEWED);
    } else {
      track(events.DIRECT_MESSAGE_THREAD_VIEWED);
    }

    return this.setState({
      activeThread: id === 'new' ? '' : id,
    });
  };

  render() {
    const {
      match,
      currentUser,
      data,
      hasError,
      fetchMore,
      isFetchingMore,
      isLoading,
    } = this.props;

    // Only logged-in users can view DM threads
    if (!currentUser) return null;
    const { activeThread } = this.state;
    const isComposing = match.url === '/messages/new' && match.isExact;
    const isViewingThread = !!match.params.threadId;
    const ThreadDetail = isViewingThread ? ExistingThread : NewThread;
    const dataExists =
      currentUser && data.user && data.user.directMessageThreadsConnection;
    const threads =
      dataExists &&
      data.user.directMessageThreadsConnection.edges &&
      data.user.directMessageThreadsConnection.edges.length > 0
        ? data.user.directMessageThreadsConnection.edges
            .map(thread => thread && thread.node)
            .sort((a, b) => {
              const x =
                a &&
                a.threadLastActive &&
                new Date(a.threadLastActive).getTime();
              const y =
                b &&
                b.threadLastActive &&
                new Date(b.threadLastActive).getTime();
              const val = parseInt(y, 10) - parseInt(x, 10);
              return val;
            })
        : [];

    if (hasError) return <ViewError />;

    const hasNextPage =
      data.user &&
      data.user.directMessageThreadsConnection &&
      data.user.directMessageThreadsConnection.pageInfo &&
      data.user.directMessageThreadsConnection.pageInfo.hasNextPage;

    return (
      <View>
        <Titlebar
          title={isComposing ? 'New Message' : 'Messages'}
          provideBack={isComposing || isViewingThread}
          backRoute={'/messages'}
          noComposer={isComposing || isViewingThread}
          messageComposer={!isComposing && !isViewingThread}
        />
        <MessagesList isViewingThread={isViewingThread || isComposing}>
          <Link to="/messages/new" onClick={() => this.setActiveThread('new')}>
            <ComposeHeader>
              <Icon glyph="message-new" />
            </ComposeHeader>
          </Link>

          <ThreadsList
            hasNextPage={hasNextPage}
            fetchMore={fetchMore}
            active={activeThread}
            threads={threads}
            currentUser={currentUser}
            isFetchingMore={isFetchingMore}
            isLoading={isLoading}
          />
        </MessagesList>

        {dataExists && (
          <ThreadDetail
            match={match}
            currentUser={currentUser}
            setActiveThread={this.setActiveThread}
            hideOnMobile={!(isComposing || isViewingThread)}
            id={match.params.threadId && match.params.threadId}
            threads={threads}
          />
        )}
      </View>
    );
  }
}

const map = state => ({
  networkOnline: state.connectionStatus.networkOnline,
  websocketConnection: state.connectionStatus.websocketConnection,
  pageVisibility: state.connectionStatus.pageVisibility,
});

export default compose(
  withCurrentUser,
  getCurrentUserDirectMessageThreads,
  markDirectMessageNotificationsSeenMutation,
  viewNetworkHandler,
  // $FlowIssue
  connect(map)
)(DirectMessages);
