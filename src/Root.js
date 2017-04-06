/**
 * The <Root /> component takes care of initially authenticating the user, showing the homepage or the app
 * and syncing the frequency and story from the URL to the Redux state. (including loading their data)
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setActiveFrequency } from './actions/frequencies';
import { setActiveStory } from './actions/stories';
import { setActiveCommunity } from './actions/communities';
import { addNotification } from './actions/notifications';
import { asyncComponent } from './helpers/utils';
import LoadingIndicator from './shared/loading/global';
import { getUserInfo } from './db/users';
import { listenToAuth } from './db/auth';
import { getFrequency } from './db/frequencies';
import { getCommunity } from './db/communities';
import { listenToNewNotifications } from './db/notifications';
import { set, track } from './EventTracker';
import { monitorUser, stopUserMonitor } from './helpers/users';
import history from './helpers/history';
import Raven from 'raven-js';

// Codesplit the App and the Homepage to only load what we need based on which route we're on
const App = asyncComponent(() =>
  System.import('./App').then(module => module.default));
const Homepage = asyncComponent(() =>
  System.import('./Homepage').then(module => module.default));

class Root extends Component {
  state = {
    frequency: '',
    story: '',
  };

  // INITIAL LOAD OF THE APP
  componentWillMount() {
    // On the initial render of the app we authenticate the user
    const { dispatch, match, communities } = this.props;
    this.handleProps({ frequencies: {}, stories: {}, match, communities });
    // Authenticate the user
    listenToAuth(user => {
      if (!user) {
        stopUserMonitor();
        return dispatch({
          type: 'USER_NOT_AUTHENTICATED',
        });
      }

      monitorUser(user.uid);

      // set this uid in google analytics
      track('user', 'authed', null);
      set(user.uid);

      // logs the user uid to sentry errors
      Raven.setUserContext({ uid: user.uid });

      listenToNewNotifications(user.uid, notification => {
        dispatch(addNotification(notification));
      });

      // Get the public userdata
      getUserInfo(user.uid)
        .then(userData => {
          if (!userData) {
            return dispatch({
              type: 'USER_NOT_AUTHENTICATED',
            });
          }
          dispatch({
            type: 'SET_USER',
            user: userData,
          });
          return userData;
        })
        // Load the users frequencies and communities
        .then(({ frequencies, communities }) => {
          const freqIds = Object.keys(frequencies);
          const communityIds = Object.keys(communities);
          return Promise.all([
            Promise.all(freqIds.map(id => getFrequency({ id }))),
            Promise.all(communityIds.map(id => getCommunity({ id }))),
          ]);
        })
        .then(([frequencies, communities]) => {
          dispatch({
            type: 'SET_COMMUNITIES',
            communities,
          });
          dispatch({
            type: 'SET_FREQUENCIES',
            frequencies,
          });
        });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.handleProps(nextProps);
  }

  handleProps = nextProps => {
    const {
      dispatch,
      match: { params },
      frequencies,
      stories,
      user: { uid },
    } = this.props;
    if (
      nextProps.match.params.community &&
      nextProps.match.params.community !== 'everything' &&
      !nextProps.match.params.frequency
    ) {
      history.push(`/${nextProps.match.params.community}/~general`);
      return;
    }

    if (
      nextProps.match.params.community !== params.community ||
      !nextProps.communities.active ||
      nextProps.user.uid !== uid
    ) {
      dispatch(
        setActiveCommunity(nextProps.match.params.community || 'everything'),
      );
    }
    // If the frequency changes or we've finished loading the frequencies sync the active frequency to the store and load the stories
    if (
      nextProps.frequencies.loaded !== frequencies.loaded ||
      nextProps.match.params.frequency !== params.frequency
    ) {
      if (nextProps.match.params.community === 'everything') {
        dispatch(setActiveStory(nextProps.match.params.frequency));
      } else {
        dispatch(setActiveFrequency(nextProps.match.params.frequency));
      }
    }

    // If the story changes sync the active story to the store and load the messages
    if (
      nextProps.stories.loaded !== stories.loaded ||
      nextProps.match.params.story !== params.story
    ) {
      if (nextProps.match.params.community !== 'everything') {
        dispatch(setActiveStory(nextProps.match.params.story));
      }
    }
  };

  render() {
    const { user, match: { params }, location } = this.props;
    // Handle loading the homepage
    if (params.frequency === undefined) {
      if (user.loginError) return <p>Login error</p>;
      if (user.uid) return <App location={location} />;
      if (user.loaded) return <Homepage />;
      return <LoadingIndicator />;
    }
    return <App location={location} />;
  }
}

export default connect(state => ({
  user: state.user || {},
  frequencies: state.frequencies || {},
  communities: state.communities || {},
  stories: state.stories || {},
}))(Root);
