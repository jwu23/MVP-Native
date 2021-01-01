import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import UserLists from './UserLists.js';
import UserFriends from './UserFriends.js';
import SignOutScreen from './SignOutScreen.js';
import FriendNavigator from './FriendNavigator.js';


const Tab = createMaterialBottomTabNavigator();

export default function UserNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator shifting={true}>
        <Tab.Screen name="Lists" component={UserLists} options={{
          tabBarIcon: ({color}) => (
            <Ionicons name="list-outline" color={color} size={25}/>
          ),
          tabBarColor: '#0576ff'
        }}/>
        <Tab.Screen name="Friends" component={FriendNavigator} options={{
          tabBarIcon: ({color}) => (
            <Ionicons name="people-outline" color={color} size={25}/>
          ),
          tabBarColor: 'orange'
        }}/>
        <Tab.Screen name='Account' component={SignOutScreen} options={{
          tabBarIcon: ({color}) => (
            <Ionicons name="settings-outline" color={color} size={25}/>
          ),
          tabBarColor: 'green'
        }}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}











// import React from 'react';
// import { View } from 'react-native';
// import { createAppContainer } from 'react-navigation';
// import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
// import UserLists from './UserLists.js';
// import UserFriends from './UserFriends.js';

// const tabNavigator = createMaterialBottomTabNavigator({
//   Lists: {
//     screen: UserLists,
//     navigationOptions: {
//       tabBarLabel: 'Lists'
//     }
//   },
//   Friends: {
//     screen: UserFriends,
//     navigationOptions: {
//       tabBarLabel: 'Friends'
//     }
//   },
// },
// {
//   initialRouteName: 'Lists',
//   activeColor: 'red',
//   inactiveColor: 'yellow',
//   barStyle: {
//     backgroundColor: 'white'
//   }
// }
// );

// export default createAppContainer(tabNavigator);