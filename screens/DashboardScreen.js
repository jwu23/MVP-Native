import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';

import { createAppContainer, createMaterialTopTabNavigator } from 'react-navigation';
import UserLists from './UserLists.js';
import UserFriends from './UserFriends.js';
import UserNavigator from './UserNavigator.js';

export default class DashboardScreen extends React.Component {

  render() {
    return (
      <UserNavigator/>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: '80%',
    backgroundColor: 'green',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  }
})