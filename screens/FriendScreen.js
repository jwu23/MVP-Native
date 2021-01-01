import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as firebase from 'firebase';
import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';


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
            <Text>{temp}</Text>
          </View>
        );
      })
    })
    return lists;
  }


  mapLists = () => {
    return this.state.userLists.map((name, index) => {
      return (
        <List.Accordion key={index} title={name} left={img => <List.Icon icon="format-list-bulleted"/>}>
          {this.mapItems(name)}
        </List.Accordion>
      )
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.listBody}>
            {this.mapLists()}
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: 'red',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'blue',
    right: 0,
  },
  standaloneRowFront: {
    // alignItems: 'center',
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    height: 50,
  },
  standaloneRowBack: {
    // alignSelf: 'flex-end',
    backgroundColor: 'green',
    flex: 1,
    // width: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    // marginLeft: 100
  },
  backTextWhite: {
    color: '#FFF',
  },
  listBody: {
    // width: '100%',
    // backgroundColor: '#24962c',
    // // borderRadius: 5,
    // height: 50,
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingLeft: 25,
    // marginRight: 10,
    // marginTop: 10
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
    backgroundColor: 'lightblue',
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