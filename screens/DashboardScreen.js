import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default class DashboardScreen extends React.Component {

  handleLogout = () => {
    this.props.navigation.navigate('LoginScreen');
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