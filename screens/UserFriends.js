import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
// import Collapsible from 'react-native-collapsible';
// import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
import Swipeout from 'react-native-swipeout';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import SearchableDropdown from 'react-native-searchable-dropdown';

export default class UserFriends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listName: null,
      listModalVisible: false,
      userFriends: [],
      collapsed: true,
      itemName: null,
      itemModalVisible: false,
      searchUsers: [],
      pendingRequests: [],
      incomingRequests: []
    }
  }

  getSearchUsers = () => {
    firebase.database().ref('users/').on('value', (snapshot) => {
      var users = [];
      snapshot.forEach(user => {
        const currentUser = firebase.auth().currentUser.uid;
        const uid = user.key;
        const email = user.val().email;
        const name = `${user.val().first} ${user.val().last}`
        if (uid !== currentUser) {
          var count = 0;
          for (var i = 0; i < this.state.userFriends.length; i++) {
            if (this.state.userFriends[i].email === email) {
              count++;
            }
          }
          for (var j = 0; j < this.state.pendingRequests.length; j++) {
            if (this.state.pendingRequests[j].email === email) {
              count++;
            }
          }
          for (var j = 0; j < this.state.incomingRequests.length; j++) {
            if (this.state.incomingRequests[j].email === email) {
              count++;
            }
          }
          if (count === 0) {
            users.push({
              uid: uid,
              name: name,
              email: email
            })
          }
        }
      })
      this.setState({
        searchUsers: users
      })
    })
  }

  getUserFriends = () => {
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends').on('value', (snapshot) => {
      var friends = [];
      snapshot.forEach(child => {
        var friendId = child.key;
        var friendEmail = child.val().email;
        var friendName = child.val().name;
        friends.push({
          uid: friendId,
          email: friendEmail,
          name: friendName
        });
      })
      this.setState({
        userFriends: friends
      }, () => {
        this.getSearchUsers()
      })
    })
  }

  getPendingRequests = () => {
    firebase.database().ref('requests/').on('value', snapshot => {
      var pending = [];
      var incoming = [];
      snapshot.forEach(request => {
        // console.log('here', typeof(request.val().user1))
        // console.log('here', request.val().user2)
        if (request.val().user1 !== undefined && request.val().user2 !== undefined) {
          var sender = request.val().user1;
          var receiver = request.val().user2;
          var currentEmail = firebase.auth().currentUser.email;
          if (sender.email === currentEmail) {
            pending.push(receiver);
          } else if (receiver.email === currentEmail) {
            incoming.push(sender);
          }
        }
      })
      this.setState({
        pendingRequests: pending,
        incomingRequests: incoming
      })
    })
  }

  componentDidMount = () => {
    this.getUserFriends();
    this.getPendingRequests();
  }

  mapFriends = () => {
    return this.state.userFriends.map((name, index) => {
      return (
        <View key={index}>
          <SwipeRow rightOpenValue={-75}>
            <TouchableOpacity style={styles.standaloneRowBack} onPress={() => console.log('detete')}>
              <Text style={styles.backTextWhite}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.listBody}>
              <Text>{name.name}</Text>
            </View>
          </SwipeRow>
        </View>
      )
    })
  }

  // addToUserFriends = (user) => {
  //   firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends/' + user.uid).set({email: user.email, name: user.name})
  // }

  acceptRequest = (user) => {
    console.log('k;sfjs;jf;', user)
    firebase.database().ref('requests/').on('value', snapshot => {
      // console.log('snaphereeeee', snapshot)
      var currSearch = this.state.userFriends;
      // console.log('1',currSearch)

      snapshot.forEach(request => {
        if (request.val().user1.email === user.email && request.val().user2.email === firebase.auth().currentUser.email) {
          currSearch.push(request.val().user1)
          // console.log('pushed', request.val().user1)
          firebase.database().ref('requests/' + request.key).remove();
        }
      })
      this.setState({
        userFriends: currSearch
      }, () => {
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends/' + user.uid).set({email: user.email, name: user.name})
        firebase.database().ref('users/' + user.uid + '/friends/' + firebase.auth().currentUser.uid).set({email: firebase.auth().currentUser.email, name: firebase.auth().currentUser.displayName})
      })
    })
  }

  declineRequest = (user) => {
    // console.log('decline', user)
    firebase.database().ref('requests/').on('value', snapshot => {
      // console.log('snaphereeeee', snapshot)
      var currSearch = this.state.searchUsers;
      // console.log('1',currSearch)

      snapshot.forEach(request => {
        if (request.val().user1.email === user.email && request.val().user2.email === firebase.auth().currentUser.email) {
          currSearch.push(request.val().user1)
          // console.log('pushed', request.val().user1)
          firebase.database().ref('requests/' + request.key).remove();
        }
      })
      this.setState({
        searchUsers: currSearch
      })
    })
  }

  mapRequests = () => {
    return this.state.incomingRequests.map((user, index) => {
      return (
        <View key={index}>
          <SwipeRow rightOpenValue={-150}>
            <View style={styles.standaloneRowBack}>
              {/* <TouchableOpacity style={{backgroundColor: 'red'}} onPress={() => console.log('detete')}>
                <Text style={styles.backTextWhite}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('add')}>
                <Text style={styles.backTextWhite}>add</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => this.acceptRequest(user)}>
                <Text style={styles.backTextWhite}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={() => this.declineRequest(user)}>
                <Text style={styles.backTextWhite}>Decline</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listBody}>
              <Text>{user.name}</Text>
            </View>
          </SwipeRow>
        </View>
      )
    })
  }

  mapPending = () => {
    return this.state.pendingRequests.map((user, index) => {
      return (
        <View key={index}>
          <SwipeRow rightOpenValue={-150}>
            <TouchableOpacity style={styles.standaloneRowBack} onPress={() => console.log('detete')}>
              <Text style={styles.backTextWhite}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.listBody}>
              <Text>{user.name}</Text>
            </View>
          </SwipeRow>
        </View>
      )
    })
  }

  sendFriendRequest = (friend) => {
    console.log('friend request', friend)
    // console.log(firebase.auth().currentUser.email)
    var currentUserInfo = {};
    var currentEmail = firebase.auth().currentUser.email;
    var currentName = firebase.auth().currentUser.displayName;
    var currentUID = firebase.auth().currentUser.uid;
    currentUserInfo.email = currentEmail;
    currentUserInfo.name = currentName;
    currentUserInfo.uid = currentUID;
    // var currentName = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/')
    firebase.database().ref('requests/').push({user1: currentUserInfo, user2: friend}).then(() => {
      var users = this.state.searchUsers;
      var removeIndex = users.map(function(user) { return user.email; }).indexOf(friend.email);
      users.splice(removeIndex, 1);
      this.setState({
        searchUsers: users
      })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container1}>
          {/* <TextInput style={styles.searchFriend} placeholder="Search"> */}
            <SearchableDropdown
              onItemSelect={(friend) => {
                this.sendFriendRequest(friend)
              }}
              containerStyle={{
                width: '100%',
                // backgroundColor: '#24962c',
                backgroundColor: 'lightblue',
                borderRadius: 5,
                // height: 50,
                // alignItems: 'center',
                // justifyContent: 'center',
                // paddingLeft: 25,
                // marginRight: 10,
                marginTop: '15%'
                // padding: 5
              }}
              // onRemoveItem={(item, index) => {
              //   const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              //   this.setState({ selectedItems: items });
              // }}
              itemStyle={{
                padding: 10,
                marginTop: 2,
                backgroundColor: '#ddd',
                borderColor: '#bbb',
                borderWidth: 1,
                borderRadius: 5,
              }}
              itemTextStyle={{ color: '#222' }}
              itemsContainerStyle={{ height: '95%' }}
              items={this.state.searchUsers}
              // defaultIndex={2}
              resetValue={false}
              textInputProps={
                {
                  placeholder: 'Search',
                  underlineColorAndroid: "transparent",
                  style: {
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                  },
                  // onTextChange: text => alert(text)
                }
              }
              listProps={
                {
                  nestedScrollEnabled: false,
                }
              }
          />
          {/* </TextInput> */}
        </View>
        <ScrollView>
          <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'orange'}}>
            <Text>Friends</Text>
          </View>
          {this.mapFriends()}
          <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'red'}}>
            <Text>Requests</Text>
          </View>
          {this.mapRequests()}
          <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'blue'}}>
            <Text>Pending</Text>
          </View>
          {this.mapPending()}
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
    width: '100%',
    backgroundColor: '#24962c',
    // borderRadius: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingLeft: 25,
    // marginRight: 10,
    // marginTop: 50
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