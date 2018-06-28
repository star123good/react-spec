// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
// NOTE(@mxstbr): This is a custom fork published of off this (as of this writing) unmerged PR: https://github.com/CassetteRocks/react-infinite-scroller/pull/38
// I literally took it, renamed the package.json and published to add support for scrollElement since our scrollable container is further outside
import InfiniteList from 'src/components/infiniteScroll';
import { deduplicateChildren } from 'src/components/infiniteScroll/deduplicateChildren';
import FlipMove from 'react-flip-move';
import { sortByDate } from '../../../helpers/utils';
import { LoadingInboxThread } from '../../../components/loading';
import { changeActiveThread } from '../../../actions/dashboardFeed';
import LoadingThreadFeed from './loadingThreadFeed';
import ErrorThreadFeed from './errorThreadFeed';
import EmptyThreadFeed from './emptyThreadFeed';
import EmptySearchFeed from './emptySearchFeed';
import InboxThread from './inboxThread';
import viewNetworkHandler from '../../../components/viewNetworkHandler';
import type { ViewNetworkHandlerType } from '../../../components/viewNetworkHandler';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import type { GetCommunityThreadConnectionType } from 'shared/graphql/queries/community/getCommunityThreadConnection';
import type { Dispatch } from 'redux';
import { ErrorBoundary } from 'src/components/error';

type Node = {
  node: {
    ...$Exact<GetThreadType>,
  },
};

type Props = {
  mountedWithActiveThread: ?string,
  queryString?: ?string,
  ...$Exact<ViewNetworkHandlerType>,
  data: {
    subscribeToUpdatedThreads: ?Function,
    threads: Array<?Node>,
    fetchMore: Function,
    loading: boolean,
    community?: GetCommunityThreadConnectionType,
    networkStatus: number,
    hasNextPage: boolean,
    feed: string,
  },
  history: Function,
  dispatch: Dispatch<Object>,
  selectedId: string,
  activeCommunity: ?string,
  activeChannel: ?string,
  hasActiveCommunity: boolean,
};

type State = {
  scrollElement: any,
  subscription: ?Function,
};

class ThreadFeed extends React.Component<Props, State> {
  innerScrollElement: any;

  constructor() {
    super();

    this.innerScrollElement = null;

    this.state = {
      scrollElement: null,
      subscription: null,
    };
  }

  subscribe = () => {
    this.setState({
      subscription:
        this.props.data.subscribeToUpdatedThreads &&
        this.props.data.subscribeToUpdatedThreads(),
    });
  };

  shouldComponentUpdate(nextProps) {
    const curr = this.props;
    // fetching more
    if (curr.data.networkStatus === 7 && nextProps.isFetchingMore) return false;
    return true;
  }

  unsubscribe = () => {
    const { subscription } = this.state;
    if (subscription) {
      // This unsubscribes the subscription
      return Promise.resolve(subscription());
    }
  };

  componentDidUpdate(prevProps) {
    const isDesktop = window.innerWidth > 768;
    const { scrollElement } = this.state;
    const { mountedWithActiveThread, queryString } = this.props;

    // user is searching, don't select anything
    if (queryString) {
      return;
    }

    // If we mount with ?t and are on mobile, we have to redirect to ?thread
    if (!isDesktop && mountedWithActiveThread) {
      this.props.history.replace(`/?thread=${mountedWithActiveThread}`);
      this.props.dispatch({ type: 'REMOVE_MOUNTED_THREAD_ID' });
      return;
    }

    const hasThreadsButNoneSelected =
      this.props.data.threads && !this.props.selectedId;
    const justLoadedThreads =
      !mountedWithActiveThread &&
      ((!prevProps.data.threads && this.props.data.threads) ||
        (prevProps.data.loading && !this.props.data.loading));

    // if the app loaded with a ?t query param, it means the user was linked to a thread from the inbox view and is already logged in. In this case we want to load the thread identified in the url and ignore the fact that a feed is loading in which auto-selects a different thread.
    if (justLoadedThreads && mountedWithActiveThread) {
      this.props.dispatch({ type: 'REMOVE_MOUNTED_THREAD_ID' });
      return;
    }

    // don't select a thread if the composer is open
    if (prevProps.selectedId === 'new') {
      return;
    }

    if (
      isDesktop &&
      (hasThreadsButNoneSelected || justLoadedThreads) &&
      this.props.data.threads.length > 0 &&
      !prevProps.isFetchingMore
    ) {
      if (
        (this.props.data.community &&
          this.props.data.community.watercooler &&
          this.props.data.community.watercooler.id) ||
        (this.props.data.community &&
          this.props.data.community.pinnedThread &&
          this.props.data.community.pinnedThread.id)
      ) {
        const selectId = this.props.data.community.watercooler
          ? this.props.data.community.watercooler.id
          : this.props.data.community.pinnedThread.id;

        this.props.history.replace(`/?t=${selectId}`);
        this.props.dispatch(changeActiveThread(selectId));
        return;
      }

      const threadNodes = this.props.data.threads
        .slice()
        .map(thread => thread && thread.node);
      const sortedThreadNodes = sortByDate(threadNodes, 'lastActive', 'desc');
      const hasFirstThread = sortedThreadNodes.length > 0;
      const firstThreadId = hasFirstThread ? sortedThreadNodes[0].id : '';
      if (hasFirstThread) {
        this.props.history.replace(`/?t=${firstThreadId}`);
        this.props.dispatch(changeActiveThread(firstThreadId));
      }
    }

    // if the user changes the feed from all to a specific community, we need to reset the active thread in the inbox and reset our subscription for updates
    if (
      (!prevProps.data.feed && this.props.data.feed) ||
      (prevProps.data.feed && prevProps.data.feed !== this.props.data.feed)
    ) {
      const threadNodes = this.props.data.threads
        .slice()
        .map(thread => thread && thread.node);
      const sortedThreadNodes = sortByDate(threadNodes, 'lastActive', 'desc');
      const hasFirstThread = sortedThreadNodes.length > 0;
      const firstThreadId = hasFirstThread ? sortedThreadNodes[0].id : '';
      if (hasFirstThread) {
        this.props.history.replace(`/?t=${firstThreadId}`);
        this.props.dispatch(changeActiveThread(firstThreadId));
      }

      if (scrollElement) {
        scrollElement.scrollTop = 0;
      }

      // $FlowFixMe
      this.unsubscribe()
        .then(() => this.subscribe())
        .catch(err => console.error('Error unsubscribing: ', err));
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    const scrollElement = document.getElementById('scroller-for-inbox');

    this.setState({
      // NOTE(@mxstbr): This is super un-reacty but it works. This refers to
      // the AppViewWrapper which is the scrolling part of the site.
      scrollElement,
    });

    this.subscribe();
  }

  render() {
    const {
      data: { threads, community },
      selectedId,
      activeCommunity,
      activeChannel,
      queryString,
      isLoading,
      hasError,
    } = this.props;
    const { scrollElement } = this.state;

    if (Array.isArray(threads)) {
      // API returned no threads
      if (threads.length === 0) {
        if (isLoading) {
          return <LoadingThreadFeed />;
        }
        if (queryString) {
          return <EmptySearchFeed queryString={queryString} />;
        } else {
          return <EmptyThreadFeed />;
        }
      }

      const threadNodes = threads.slice().map(thread => thread && thread.node);

      let sortedThreadNodes = sortByDate(threadNodes, 'lastActive', 'desc');

      if (activeCommunity) {
        sortedThreadNodes = sortedThreadNodes.filter(t => !t.watercooler);
      }

      // Filter the watercooler and pinned threads from the feed if we're on the community view
      // since they're automatically shown at the top
      let filteredThreads = sortedThreadNodes;
      if (community) {
        if (community.watercooler && community.watercooler.id) {
          filteredThreads = filteredThreads.filter(
            t => t.id !== community.watercooler.id
          );
        }
        if (community.pinnedThread && community.pinnedThread.id) {
          filteredThreads = filteredThreads.filter(
            t => t.id !== community.pinnedThread.id
          );
        }
      }

      const uniqueThreads = deduplicateChildren(filteredThreads, 'id');

      let viewContext;
      if (activeCommunity) viewContext = 'communityInbox';
      if (activeChannel) viewContext = 'channelInbox';

      return (
        <div
          data-cy="inbox-thread-feed"
          ref={el => (this.innerScrollElement = el)}
        >
          {community &&
            community.watercooler &&
            community.watercooler.id && (
              <ErrorBoundary fallbackComponent={null}>
                <InboxThread
                  data={community.watercooler}
                  active={selectedId === community.watercooler.id}
                  viewContext={viewContext}
                />
              </ErrorBoundary>
            )}

          {community &&
            community.pinnedThread &&
            community.pinnedThread.id && (
              <ErrorBoundary fallbackComponent={null}>
                <InboxThread
                  data={community.pinnedThread}
                  active={selectedId === community.pinnedThread.id}
                  viewContext={viewContext}
                />
              </ErrorBoundary>
            )}
          <InfiniteList
            pageStart={0}
            loadMore={this.props.data.fetchMore}
            isLoadingMore={this.props.isFetchingMore}
            hasMore={this.props.data.hasNextPage}
            loader={<LoadingInboxThread />}
            useWindow={false}
            initialLoad={false}
            scrollElement={scrollElement}
            threshold={750}
            className={'scroller-for-dashboard-threads'}
          >
            <FlipMove duration={350}>
              {uniqueThreads.map(thread => {
                return (
                  <ErrorBoundary fallbackComponent={null} key={thread.id}>
                    <InboxThread
                      data={thread}
                      active={selectedId === thread.id}
                      viewContext={viewContext}
                    />
                  </ErrorBoundary>
                );
              })}
            </FlipMove>
          </InfiniteList>
        </div>
      );
    }

    if (isLoading) return <LoadingThreadFeed />;

    if (hasError) return <ErrorThreadFeed />;

    return null;
  }
}
const map = state => ({
  mountedWithActiveThread: state.dashboardFeed.mountedWithActiveThread,
  activeCommunity: state.dashboardFeed.activeCommunity,
  activeChannel: state.dashboardFeed.activeChannel,
});
export default compose(
  withRouter,
  // $FlowIssue
  connect(map),
  viewNetworkHandler
)(ThreadFeed);
