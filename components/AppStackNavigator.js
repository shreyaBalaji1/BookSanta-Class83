import React from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import RecieverDetailsScreen from "../screens/RecieverDetailsScreen";
import BookDonateScreen from "../screens/BookDonateScreen";

export const AppStackNavigator = createStackNavigator({
    BookDonateList : {
      screen : BookDonateScreen,
      navigationOptions: {
          headerShown: false
      }
      },
    RecieverDetails : {
      screen: RecieverDetailsScreen,
      navigationOptions: {
          headerShown: false
      }
    },
  },
  {
    initialRouteName : 'BookDonateList'
  })
