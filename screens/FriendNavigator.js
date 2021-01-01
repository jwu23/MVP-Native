import React from 'react';
import { View, Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UserFriends from './UserFriends.js';
import FriendScreen from './FriendScreen.js';

const Stack = createStackNavigator();

export default class FriendNavigator extends React.Component {
  render() {
    return (
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen options={{headerShown: false}} name="Friends" component={UserFriends} />
          <Stack.Screen options={({route}) => ({title: route.params.user.name, headerStyle: { backgroundColor: 'orange' }})} name="Details" component={FriendScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}