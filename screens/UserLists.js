import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default class UserLists extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <Text>User Lists</Text>
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
  }
})