import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as firebase from 'firebase';
import Accordion from 'react-native-collapsible';
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
    console.log('friend list', this.props.route.params)
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
      // console.log('val', snapshot)
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
      <LinearGradient colors={['blue', 'orange']} style={{flex: 1}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
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
    // backgroundColor: 'lightblue',
    justifyContent: 'center',
    height: 50,
  },
  individualList: {
    width: '100%',
    backgroundColor: '#63c96a',
    // borderRadius: 25,
    borderWidth: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 10,
    // marginTop: 20
  },
  container: {
    flex: 1,
    // backgroundColor: 'lightblue',
    // alignItems: 'flex-end',
    // justifyContent: 'center',
  },
  container1: {
    backgroundColor: 'lightblue',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
  },
  searchFriend: {
    width: '100%',
    backgroundColor: '#24962c',
    borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 25,
    // marginRight: 10,
    marginTop: 50
  },
  newItem: {
    flex: 3.5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5
  },
  addItemButton: {
    flex: 1,
    padding: 5,
    backgroundColor: 'red',
  },
  modalView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
    marginBottom: '50%',
    height: '100%',
  },
  inputView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20
  },
  itemInputView: {
    flexDirection: 'row'
  },
  inputText: {
    height: 50
  },
  newListButton: {
    width: '80%',
    backgroundColor: '#24962c',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  },
})