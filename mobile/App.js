// @flow
import 'string.fromcodepoint';
import Sentry from 'sentry-expo';
import React, { Fragment } from 'react';
import { StatusBar } from 'react-native';
import { SecureStore, AppLoading } from 'expo';
import { Provider } from 'react-redux';
import { ApolloProvider, Query } from 'react-apollo';
import { ThemeProvider } from 'styled-components';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { type ApolloClient } from 'apollo-client';
import { initStore } from './reducers/store';

import Toasts from './components/Toasts';
import theme from '../shared/theme';
import { createClient } from '../shared/graphql';
import Login from './views/Login';
import TabBar from './views/TabBar/App';
import { SetUsername, ExploreCommunities } from './views/UserOnboarding';
import { authenticate } from './actions/authentication';

import { getCurrentUserCommunityConnectionQuery } from '../shared/graphql/queries/user/getUserCommunityConnection';

let sentry = Sentry.config(
  'https://3bd8523edd5d43d7998f9b85562d6924@sentry.io/154812'
);

// Need to guard this for HMR to work
if (sentry && sentry.install) sentry.install();

export const store = initStore();

type State = {
  authLoaded: ?boolean,
  token: ?string,
  client: ApolloClient,
};

class App extends React.Component<{}, State> {
  state = {
    authLoaded: null,
    token: null,
    client: createClient(),
  };

  componentDidMount = async () => {
    // Subscribe to Redux state changes
    store.subscribe(this.listen);

    let token;
    try {
      token = await SecureStore.getItemAsync('token');
    } catch (err) {
      Sentry.captureException(err);
      this.setState({
        authLoaded: true,
      });
    }

    if (token) store.dispatch(authenticate(token));
    this.setState({
      authLoaded: true,
      token,
    });
  };

  listen = () => {
    const storeState = store.getState();
    // $FlowFixMe
    const authentication = storeState && storeState.authentication;
    const { token: oldToken } = this.state;
    if (authentication.token !== oldToken) {
      this.setState({
        token: authentication.token,
        // Create a new Apollo Client with the token
        // NOTE(@mxstbr): This wipes out the cache as this creates an entirely new client
        // Ideally this would only change link.headers.authorization, but that doesn't seem possible currently
        // Ref apollographql/apollo-link#461
        client: createClient({ token: authentication.token }),
      });
    }
  };

  render() {
    if (!this.state.authLoaded) {
      return <AppLoading />;
    }

    const { client, token } = this.state;

    return (
      <Provider store={store}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <ActionSheetProvider>
              <Fragment>
                <StatusBar barStyle={'default'} />
                <Toasts />
                {/* If there's either no token or the token is invalid (as shown by no user being returned when using it to fetch) show the login screen */}
                {!token ? (
                  <Login />
                ) : (
                  <Query query={getCurrentUserCommunityConnectionQuery}>
                    {({ data: { user }, networkStatus, refetch }) => {
                      if (networkStatus === 1 || networkStatus === 2)
                        return null;
                      if (!user) return <Login />;
                      if (!user.username) return <SetUsername />;
                      if (user.communityConnection.edges.length === 0)
                        return <ExploreCommunities refetch={refetch} />;
                      return <TabBar />;
                    }}
                  </Query>
                )}
              </Fragment>
            </ActionSheetProvider>
          </ThemeProvider>
        </ApolloProvider>
      </Provider>
    );
  }
}

export default App;
