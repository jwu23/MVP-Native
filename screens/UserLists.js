import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
import Swipeout from 'react-native-swipeout';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';


export default class UserLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listName: null,
      listModalVisible: false,
      userLists: [],
      collapsed: true,
      itemName: null,
      itemModalVisible: false
    }
  }

  componentDidMount = () => {
    // firebase.database().ref('lists/' + firebase.auth().currentUser.uid + '/List 2').push('ifsdf')
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid).on('value', (snapshot) => {
      var lists = [];
      // console.log('val', snapshot)
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

  addNewList = () => {
    console.log(firebase.auth().currentUser.uid)
    if (this.state.listName !== null) {
      firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${this.state.listName}`).set('')
      setTimeout(() => {
        alert('List created')
      }, 525)
      this.setState({
        listModalVisible: !this.state.listModalVisible
      })
    }
  }

  openCloseListModal = () => {
    this.setState({
      listModalVisible: !this.state.listModalVisible
    })
  }

  mapItems = (listName) => {
    var lists = [];
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}`).on('value', (snapshot) => {
      // console.log('val', snapshot)
      snapshot.forEach(child => {
        var temp = child.val();
        var itemKey = child.key;
        lists.push(
          <View key={temp}>
            <SwipeRow rightOpenValue={-75}>
              <TouchableOpacity style={styles.standaloneRowBack} onPress={() => this.deleteItem(listName, itemKey)}>
                <Text style={styles.backTextWhite}>Delete</Text>
              </TouchableOpacity>
              <View style={styles.standaloneRowFront}>
                <Text>{temp}</Text>
              </View>
            </SwipeRow>
          </View>
        );
      })
    })
    return lists;
  }

  deleteItem = (listName, itemKey) => {
    // console.log('delete', itemName)
    console.log('list', listName)
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}/` + itemKey).remove();
  }

  createItem = (listName) => {
    console.log(this.state.itemName)
    if (this.state.itemName !== null) {
      firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}`).push(this.state.itemName);
      this.textInput.clear();
    }
  }

  mapLists = () => {
    return this.state.userLists.map((name, index) => {
      return (
        <List.Accordion key={index} title={name} left={img => <List.Icon icon="format-list-bulleted"/>}>
          <View style={styles.itemInputView}>
            <TextInput ref={input => { this.textInput = input }} placeholder="New Item" style={styles.newItem} onChangeText={text => this.setState({itemName: text})}></TextInput>
            <TouchableOpacity style={styles.addItemButton} onPress={() => this.createItem(name)}>
              <Ionicons name='add' color={'black'} size={20}/>
            </TouchableOpacity>
          </View>
          {this.mapItems(name)}
        </List.Accordion>
      )
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container1}>
          <TouchableOpacity style={styles.newList} onPress={this.openCloseListModal}>
            <Ionicons name='add' color={'black'} size={20}/>
            <Text>New List</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.listBody}>
            {this.mapLists()}
          </View>
        </ScrollView>
        <Modal animationType="slide" transparent={true} visible={this.state.listModalVisible}>
          <View style={styles.modalView}>
            <View style={styles.inputView}>
              <TextInput style={styles.inputText} placeholder="List Name" onChangeText={text => this.setState({listName: text})}>
              </TextInput>
            </View>
            <TouchableOpacity style={styles.newListButton} onPress={this.addNewList}>
              <Text>Create List</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.openCloseListModal}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  standaloneRowFront: {
    // alignItems: 'center',
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    height: 50,
  },
  standaloneRowBack: {
    alignSelf: 'flex-end',
    backgroundColor: '#8BC645',
    flex: 1,
    width: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    // marginLeft: 100
  },
  backTextWhite: {
    color: '#FFF',
  },
  listBody: {
    marginTop: 20
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
    // justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
  },
  newList: {
    width: '20%',
    // backgroundColor: '#24962c',
    backgroundColor: '#0576ff',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    // backgroundColor: '#24962c',
    backgroundColor: '#0576ff',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  },
})