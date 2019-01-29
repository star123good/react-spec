// @flow
import React, { Component } from 'react';
import compose from 'recompose/compose';
import Textarea from 'react-textarea-autosize';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import debounce from 'debounce';
import queryString from 'query-string';
import { KeyBindingUtil } from 'draft-js';
import Dropzone from 'react-dropzone';
import { closeComposer } from '../../actions/composer';
import { changeActiveThread } from '../../actions/dashboardFeed';
import { addToastWithTimeout } from '../../actions/toasts';
import Editor from '../rich-text-editor';
import {
  toPlainText,
  fromPlainText,
  toJSON,
  toState,
  isAndroid,
} from 'shared/draft-utils';
import getComposerCommunitiesAndChannels from 'shared/graphql/queries/composer/getComposerCommunitiesAndChannels';
import type { GetComposerType } from 'shared/graphql/queries/composer/getComposerCommunitiesAndChannels';
import publishThread from 'shared/graphql/mutations/thread/publishThread';
import uploadImage, {
  type UploadImageInput,
} from 'shared/graphql/mutations/uploadImage';
import { TextButton, Button } from '../buttons';
import { FlexRow } from '../../components/globals';
import { LoadingSelect } from '../loading';
import Titlebar from '../../views/titlebar';
import type { Dispatch } from 'redux';
import {
  Container,
  ThreadDescription,
  ThreadTitle,
  ThreadInputs,
  Actions,
  Dropdowns,
  RequiredSelector,
  DisabledWarning,
} from './style';
import {
  sortCommunities,
  sortChannels,
  getDefaultActiveChannel,
} from './utils';
import { events, track } from 'src/helpers/analytics';
import { ESC, ENTER } from 'src/helpers/keycodes';

type State = {
  title: string,
  body: Object,
  availableCommunities: Array<any>,
  availableChannels: Array<any>,
  activeCommunity: ?string,
  activeChannel: ?string,
  isPublishing: boolean,
  postWasPublished: boolean,
};

type Props = {
  data: {
    user: GetComposerType,
    refetch: Function,
    loading: boolean,
  },
  uploadImage: (input: UploadImageInput) => Promise<string>,
  isOpen: boolean,
  dispatch: Dispatch<Object>,
  publishThread: Function,
  history: Object,
  location: Object,
  activeCommunity?: string,
  activeChannel?: string,
  threadSliderIsOpen?: boolean,
  isInbox: boolean,
  websocketConnection: string,
  networkOnline: boolean,
};

const LS_BODY_KEY = 'last-plaintext-thread-composer-body';
const LS_TITLE_KEY = 'last-thread-composer-title';
const LS_COMPOSER_EXPIRE = 'last-thread-composer-expire';

const ONE_DAY = (): string => {
  const time = new Date().getTime() + 60 * 60 * 24 * 1000;
  return time.toString();
};

// We persist the body and title to localStorage
// so in case the app crashes users don't loose content
class ComposerWithData extends Component<Props, State> {
  bodyEditor: any;

  constructor(props) {
    super(props);

    let { storedBody, storedTitle } = this.getTitleAndBody();

    const { activeCommunitySlug, activeChannelSlug } = queryString.parse(
      props.location.search
    );

    this.state = {
      title: '',
      body: '',
      availableCommunities: [],
      availableChannels: [],
      activeCommunity: activeCommunitySlug || '',
      activeChannel: activeChannelSlug || '',
      isPublishing: false,
      postWasPublished: false,
    };

    this.persistBodyToLocalStorageWithDebounce = debounce(
      this.persistBodyToLocalStorageWithDebounce,
      500
    );
    this.persistTitleToLocalStorageWithDebounce = debounce(
      this.persistTitleToLocalStorageWithDebounce,
      500
    );
  }

  removeStorage = () => {
    localStorage.removeItem(LS_BODY_KEY);
    localStorage.removeItem(LS_TITLE_KEY);
    localStorage.removeItem(LS_COMPOSER_EXPIRE);
  };

  getTitleAndBody = () => {
    let storedBody;
    let storedTitle;

    if (localStorage) {
      try {
        const expireTime = localStorage.getItem(LS_COMPOSER_EXPIRE);
        const currTime = new Date().getTime().toString();
        /////if current time is greater than valid till of text then please expire title/body back to ''
        if (expireTime && currTime > expireTime) {
          this.removeStorage();
        } else {
          storedBody = toState(
            JSON.parse(localStorage.getItem(LS_BODY_KEY) || '')
          );
          storedTitle = localStorage.getItem(LS_TITLE_KEY);
        }
      } catch (err) {
        this.removeStorage();
      }
    }
    return {
      storedBody,
      storedTitle,
    };
  };

  handleIncomingProps = props => {
    const { user } = props.data;
    // if the user doesn't exist, bust outta here
    if (!user || !user.id || !user.communityConnection) return;

    const hasCommunities =
      user.communityConnection.edges &&
      user.communityConnection.edges.length > 0;
    const hasChannels =
      user.channelConnection.edges && user.channelConnection.edges.length > 0;

    if (!hasCommunities || !hasChannels) {
      return this.setState({
        availableCommunities: [],
        availableChannels: [],
        activeCommunity: null,
        activeChannel: null,
      });
    }

    const communities = sortCommunities(
      user.communityConnection.edges
        // $FlowFixMe
        .map(edge => edge && edge.node)
        .filter(Boolean)
    );

    const channels = sortChannels(
      user.channelConnection.edges
        // $FlowFixMe
        .map(edge => edge && edge.node)
        .filter(channel => channel && !channel.isArchived)
        .filter(Boolean)
    );

    const activeSlug = props.activeCommunity || this.state.activeCommunity;
    let community;

    // User is viewing a community/channel? Use the community from the URL
    if (activeSlug) {
      community = communities.find(
        community => community.slug.toLowerCase() === activeSlug.toLowerCase()
      );
    } else {
      community = communities && communities.length > 0 ? communities[0] : null;
    }

    if (!community || !community.id) return props.data.refetch();

    // get the channels for the active community
    const communityChannels = channels
      .filter(
        channel => channel && community && channel.community.id === community.id
      )
      .filter(channel => channel && !channel.isArchived);

    const activeChannel = getDefaultActiveChannel(
      communityChannels,
      props.activeChannel
    );

    this.setState({
      availableCommunities: communities,
      availableChannels: channels,
      activeCommunity: community ? community.id : null,
      activeChannel: activeChannel ? activeChannel.id : null,
    });
  };

  componentWillMount() {
    let { storedBody, storedTitle } = this.getTitleAndBody();
    this.setState({
      title: this.state.title || storedTitle || '',
      body: this.state.body || storedBody || '',
    });
  }

  componentDidMount() {
    this.handleIncomingProps(this.props);
    track(events.THREAD_CREATED_INITED);
    // $FlowIssue
    document.addEventListener('keydown', this.handleKeyPress, false);
  }

  componentWillUnmount() {
    // $FlowIssue
    document.removeEventListener('keydown', this.handleKeyPress, false);
    const { postWasPublished } = this.state;

    // if a post was published, in this session, clear redux so that the next
    // composer open will start fresh
    if (postWasPublished) return this.closeComposer('clear');

    // otherwise, clear the composer normally and save the state
    return this.closeComposer();
  }

  handleKeyPress = e => {
    const esc = e.keyCode === ESC;
    const cmdEnter =
      e.keyCode === ENTER && KeyBindingUtil.hasCommandModifier(e);

    if (esc) {
      // Community/channel view
      this.closeComposer();
      // Dashboard
      this.activateLastThread();
      return;
    }

    if (cmdEnter) return this.publishThread();
  };

  activateLastThread = () => {
    // we get the last thread id from the query params and dispatch it
    // as the active thread.
    const { location } = this.props;
    const { t: threadId } = queryString.parse(location.search);

    this.props.dispatch(changeActiveThread(threadId));
  };

  changeTitle = e => {
    const title = e.target.value;
    this.persistTitleToLocalStorageWithDebounce(title);
    if (/\n$/g.test(title)) {
      this.bodyEditor.focus && this.bodyEditor.focus();
      return;
    }
    this.setState({
      title,
    });
  };

  changeBody = evt => {
    const body = evt.target.value;
    this.persistBodyToLocalStorageWithDebounce(body);
    this.setState({
      body,
    });
  };

  componentWillUpdate(next) {
    const currChannelLength =
      this.props.data.user &&
      this.props.data.user.channelConnection &&
      this.props.data.user.channelConnection.edges.length;
    const nextChannelLength =
      next.data.user &&
      next.data.user.channelConnection &&
      next.data.user.channelConnection.edges.length;
    const currCommunityLength =
      this.props.data.user &&
      this.props.data.user.communityConnection &&
      this.props.data.user.communityConnection.edges.length;
    const nextCommunityLength =
      next.data.user &&
      next.data.user.communityConnection &&
      next.data.user.communityConnection.edges.length;

    if (
      (this.props.data.loading && !next.data.loading) ||
      currChannelLength !== nextChannelLength ||
      currCommunityLength !== nextCommunityLength
    ) {
      this.handleIncomingProps(next);
    }
  }

  closeComposer = (clear?: string) => {
    this.persistBodyToLocalStorage(this.state.body);
    this.persistTitleToLocalStorage(this.state.title);
    // we will clear the composer if it unmounts as a result of a post
    // being published, that way the next composer open will start fresh
    if (clear) {
      this.clearEditorStateAfterPublish();
    }

    return this.props.dispatch(closeComposer());
  };

  clearEditorStateAfterPublish = () => {
    try {
      this.removeStorage();
    } catch (err) {
      console.error(err);
    }
  };

  onCancelClick = () => {
    this.activateLastThread();
  };

  handleTitleBodyChange = titleOrBody => {
    if (titleOrBody === 'body') {
      localStorage.setItem(LS_BODY_KEY, this.state.body);
    } else {
      localStorage.setItem(LS_TITLE_KEY, this.state.title);
    }
    localStorage.setItem(LS_COMPOSER_EXPIRE, ONE_DAY());
  };

  persistBodyToLocalStorageWithDebounce = body => {
    if (!localStorage) return;
    this.handleTitleBodyChange('body');
  };

  persistTitleToLocalStorageWithDebounce = title => {
    if (!localStorage) return;
    this.handleTitleBodyChange('title');
  };

  persistTitleToLocalStorage = title => {
    if (!localStorage) return;
    this.handleTitleBodyChange('title');
  };

  persistBodyToLocalStorage = body => {
    if (!localStorage) return;
    this.handleTitleBodyChange('body');
  };

  setActiveCommunity = e => {
    const newActiveCommunity = e.target.value;
    const activeCommunityChannels = this.state.availableChannels.filter(
      channel => channel.community.id === newActiveCommunity
    );
    const newActiveCommunityData = this.state.availableCommunities.find(
      community => community.id === newActiveCommunity
    );
    const isActiveCommunity =
      newActiveCommunityData &&
      this.props.activeCommunity === newActiveCommunityData.slug;
    const newActiveChannel = getDefaultActiveChannel(
      activeCommunityChannels,
      isActiveCommunity ? this.props.activeChannel : ''
    );

    this.setState({
      activeCommunity: newActiveCommunity,
      activeChannel: newActiveChannel && newActiveChannel.id,
    });
  };

  setActiveChannel = e => {
    const activeChannel = e.target.value;

    this.setState({
      activeChannel,
    });
  };

  uploadFiles = files => {
    return this.props
      .uploadImage({
        image: files[0],
        type: 'threads',
      })
      .then(res => {
        console.log({ res });
      })
      .catch(err => {
        console.log({ err });
      });
  };

  publishThread = () => {
    // if no title and no channel is set, don't allow a thread to be published
    if (!this.state.title || !this.state.activeChannel) {
      return;
    }

    // isPublishing will change the publish button to a loading spinner
    this.setState({
      isPublishing: true,
    });

    const { dispatch, networkOnline, websocketConnection } = this.props;

    if (!networkOnline) {
      return dispatch(
        addToastWithTimeout(
          'error',
          'Not connected to the internet - check your internet connection or try again'
        )
      );
    }

    if (
      websocketConnection !== 'connected' &&
      websocketConnection !== 'reconnected'
    ) {
      return dispatch(
        addToastWithTimeout(
          'error',
          'Error connecting to the server - hang tight while we try to reconnect'
        )
      );
    }

    // define new constants in order to construct the proper shape of the
    // input for the publishThread mutation
    const { activeChannel, activeCommunity, title, body } = this.state;
    const channelId = activeChannel;
    const communityId = activeCommunity;

    const content = {
      title: title.trim(),
      body: body,
    };

    // // Get the images
    // const filesToUpload = Object.keys(jsonBody.entityMap)
    //   .filter(
    //     key =>
    //       jsonBody.entityMap[key].type.toLowerCase() === 'image' &&
    //       jsonBody.entityMap[key].data.file &&
    //       jsonBody.entityMap[key].data.file.constructor === File
    //   )
    //   .map(key => jsonBody.entityMap[key].data.file);

    // this.props.mutate comes from a higher order component defined at the
    // bottom of this file
    const thread = {
      channelId,
      communityId,
      // NOTE(@mxstbr): On android we send plain text content
      // which is parsed as markdown to draftjs on the server
      type: 'TEXT',
      content,
      // filesToUpload,
    };

    // one last save to localstorage
    this.persistBodyToLocalStorage(this.state.body);
    this.persistTitleToLocalStorage(this.state.title);

    this.props
      .publishThread(thread)
      // after the mutation occurs, it will either return an error or the new
      // thread that was published
      .then(({ data }) => {
        // get the thread id to redirect the user
        const id = data.publishThread.id;

        this.clearEditorStateAfterPublish();

        // stop the loading spinner on the publish button
        this.setState({
          isPublishing: false,
          postWasPublished: true,
        });

        // redirect the user to the thread
        // if they are in the inbox, select it
        this.props.dispatch(
          addToastWithTimeout('success', 'Thread published!')
        );
        if (this.props.isInbox) {
          this.props.history.replace(`/?t=${id}`);
          this.props.dispatch(changeActiveThread(id));
        } else if (this.props.location.pathname === '/new/thread') {
          this.props.history.replace(`/?thread=${id}`);
        } else {
          this.props.history.push(`?thread=${id}`);
          this.props.dispatch(changeActiveThread(null));
        }
        return;
      })
      .catch(err => {
        this.setState({
          isPublishing: false,
        });
        this.props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  render() {
    const {
      title,
      availableChannels,
      availableCommunities,
      activeCommunity,
      activeChannel,
      isPublishing,
    } = this.state;

    const {
      data: { user },
      threadSliderIsOpen,
      networkOnline,
      websocketConnection,
    } = this.props;
    const dataExists = user && availableCommunities && availableChannels;

    const networkDisabled =
      !networkOnline ||
      (websocketConnection !== 'connected' &&
        websocketConnection !== 'reconnected');

    return (
      <Container>
        <Titlebar provideBack title={'New conversation'} noComposer />
        <Dropdowns>
          <span>To:</span>
          {!dataExists ? (
            <LoadingSelect />
          ) : (
            <RequiredSelector
              data-cy="composer-community-selector"
              onChange={this.setActiveCommunity}
              value={activeCommunity}
            >
              {availableCommunities.map(community => {
                return (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                );
              })}
            </RequiredSelector>
          )}
          {!dataExists ? (
            <LoadingSelect />
          ) : (
            <RequiredSelector
              data-cy="composer-channel-selector"
              onChange={this.setActiveChannel}
              value={activeChannel}
            >
              {availableChannels
                .filter(channel => channel.community.id === activeCommunity)
                .map(channel => {
                  return (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  );
                })}
            </RequiredSelector>
          )}
        </Dropdowns>
        <Dropzone
          accept={['image/gif', 'image/jpeg', 'image/png', 'video/mp4']}
          disableClick
          multiple={false}
          onDropAccepted={this.uploadFiles}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div {...getRootProps()}>
              <ThreadInputs>
                <input {...getInputProps()} />
                <Textarea
                  data-cy="composer-title-input"
                  onChange={this.changeTitle}
                  style={ThreadTitle}
                  value={this.state.title}
                  placeholder={"What's up?"}
                  ref={'titleTextarea'}
                  autoFocus={!threadSliderIsOpen}
                />

                <Textarea
                  onChange={this.changeBody}
                  state={this.state.body}
                  style={ThreadDescription}
                  ref={editor => (this.bodyEditor = editor)}
                  placeholder={'Write more thoughts here...'}
                  className={'threadComposer'}
                />
              </ThreadInputs>
            </div>
          )}
        </Dropzone>

        <Actions>
          {networkDisabled && (
            <DisabledWarning>
              Lost connection to the internet or server...
            </DisabledWarning>
          )}

          <FlexRow>
            <TextButton hoverColor="warn.alt" onClick={this.onCancelClick}>
              Cancel
            </TextButton>
            <Button
              data-cy="composer-publish-button"
              onClick={this.publishThread}
              loading={isPublishing}
              disabled={
                !title ||
                title.trim().length === 0 ||
                isPublishing ||
                networkDisabled
              }
              color={'brand'}
            >
              Publish
            </Button>
          </FlexRow>
        </Actions>
      </Container>
    );
  }
}

export const ThreadComposer = compose(
  uploadImage,
  getComposerCommunitiesAndChannels, // query to get data
  publishThread, // mutation to publish a thread
  withRouter // needed to use history.push() as a post-publish action
)(ComposerWithData);

const mapStateToProps = state => ({
  isOpen: state.composer.isOpen,
  threadSliderIsOpen: state.threadSlider.isOpen,
  websocketConnection: state.connectionStatus.websocketConnection,
  networkOnline: state.connectionStatus.networkOnline,
});

// $FlowIssue
const Composer = connect(mapStateToProps)(ThreadComposer);
export default Composer;
