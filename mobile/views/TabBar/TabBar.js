// @flow
import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import theme from '../../../shared/theme';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import NotificationsStack from './NotificationsStack';
import DMStack from './DirectMessageStack';
import SearchStack from './SearchStack';
import {
  SearchIcon,
  HomeIcon,
  MessageIcon,
  NotificationIcon,
  ProfileIcon,
} from './Icons';

const shouldRenderTabBar = navigation => {
  let showTabbar = true;

  const { routes } = navigation.state;
  const nonTabbarRoutes = ['Thread', 'DirectMessageThread'];

  routes.forEach(route => {
    if (nonTabbarRoutes.indexOf(route.routeName) >= 0) {
      showTabbar = false;
    }
  });

  return showTabbar;
};
const IS_PROD = process.env.NODE_ENV === 'production';

const routeConfiguration = {
  Home: {
    screen: HomeStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <HomeIcon color={tintColor} />,
    },
  },
  Messages: {
    screen: DMStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <MessageIcon color={tintColor} />,
    },
  },
  Search: {
    screen: SearchStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <SearchIcon color={tintColor} />,
    },
  },
  Notifications: {
    screen: NotificationsStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <NotificationIcon color={tintColor} />,
    },
  },
  Profile: {
    screen: ProfileStack,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <ProfileIcon color={tintColor} />,
    },
  },
};

const tabBarConfiguration = {
  initialRouteName: 'Home',
  tabBarOptions: {
    activeTintColor: IS_PROD ? theme.brand.alt : theme.text.reverse,
    inactiveTintColor: IS_PROD ? theme.text.alt : theme.warn.border,
    labelStyle: {
      fontWeight: 'bold',
      marginBottom: 3,
    },
    style: IS_PROD ? {} : { backgroundColor: theme.warn.alt },
  },
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: shouldRenderTabBar(navigation),
  }),
};

// NOTE(@mxstbr): I figured this out manually by simply inspecting in the simulator
export const TAB_BAR_HEIGHT = 375;

export default createBottomTabNavigator(
  routeConfiguration,
  tabBarConfiguration
);
