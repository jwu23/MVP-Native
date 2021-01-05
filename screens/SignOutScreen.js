import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import { LinearGradient } from 'expo-linear-gradient';

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
      <LinearGradient colors={['blue', 'orange', 'green']} style={{flex: 1, opacity: .8}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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