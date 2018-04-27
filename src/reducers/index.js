// @flow
import { combineReducers } from 'redux';
import users from './users';
import composer from './composer';
import modals from './modals';
import toasts from './toasts';
import directMessageThreads from './directMessageThreads';
import gallery from './gallery';
import newUserOnboarding from './newUserOnboarding';
import newActivityIndicator from './newActivityIndicator';
import dashboardFeed from './dashboardFeed';
import threadSlider from './threadSlider';
import notifications from './notifications';
import message from './message';
import connectionStatus from './connectionStatus';
import type { Reducer } from 'redux';

// Allow dependency injection of extra reducers, we need this for SSR
const getReducers = (extraReducers: { [key: string]: Reducer<*, *> }) => {
  return combineReducers({
    users,
    modals,
    toasts,
    directMessageThreads,
    gallery,
    composer,
    newUserOnboarding,
    newActivityIndicator,
    dashboardFeed,
    threadSlider,
    notifications,
    connectionStatus,
    message,
    ...extraReducers,
  });
};

export default getReducers;
