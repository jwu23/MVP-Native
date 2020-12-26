import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';
import LoginScreen from './LoginScreen.js';

export default class SignOutScreen extends React.Component {

  handleLogout = () => {
    try {
      firebase.auth().signOut();
      console.log('signed out');
    }
    catch (err) {
      console.log(err.toString());
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
          <Text>Log Out</Text>
        </TouchableOpacity>
      </View>
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