import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import firebase from 'firebase';
// import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


export default class FriendScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userLists: [],
    }
  }

  componentDidMount = () => {
    // console.log('friend list', this.props.route.params)
    firebase.database().ref('lists/' + this.props.route.params.user.uid).on('value', (snapshot) => {
      var lists = [];
      snapshot.forEach(child => {
        var temp = child.key;
        lists.push(temp);
      })
      this.setState({
        userLists: lists
      }, () => {console.log('here', this.state.userLists)
      })
    })
  }

  mapItems = (listName) => {
    var lists = [];
    firebase.database().ref('lists/' + this.props.route.params.user.uid + `/${listName}`).on('value', (snapshot) => {
      snapshot.forEach(child => {
        var temp = child.val();
        lists.push(
          <View key={temp} style={styles.standaloneRowFront}>
            <Text style={styles.textColor}>{temp}</Text>
          </View>
        );
      })
    })
    return lists;
  }

  mapLists = () => {
    return this.state.userLists.map((name, index) => {
      return (
        // left={img => <List.Icon icon="format-list-bulleted"/>}
        <List.Accordion key={index} title={name} theme={{ colors: { primary: 'white' }}}>
          {this.mapItems(name)}
        </List.Accordion>
      )
    })
  }

  render() {
    return (
      <LinearGradient colors={['orange', 'green', 'blue']} style={{flex: 1}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.container}>
          <ScrollView>
            <View>
              {this.mapLists()}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  textColor: {
    color: 'white'
  },
  standaloneRowFront: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  individualList: {
    width: '100%',
    backgroundColor: '#63c96a',
    borderWidth: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  container1: {
    backgroundColor: 'lightblue',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
})