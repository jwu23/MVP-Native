import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
// import Collapsible from 'react-native-collapsible';
// import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
import Swipeout from 'react-native-swipeout';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { LinearGradient } from 'expo-linear-gradient';
import * as GestureHandler from 'react-native-gesture-handler';
const { Swipeable } = GestureHandler;

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

  openCloseListModal = () => {
    this.setState({
      listModalVisible: !this.state.listModalVisible
    })
  }

  deleteFriend = (name) => {
    console.log('fjlksdfjlsk', name.uid)
    firebase.database().ref('users/' + name.uid + '/friends/' + firebase.auth().currentUser.uid).remove();
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends/' + name.uid).remove();
  }

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
    firebase.database().ref('requests/').on('value', snapshot => {
      var currSearch = this.state.searchUsers;
      snapshot.forEach(request => {
        if (request.val().user1.email === user.email && request.val().user2.email === firebase.auth().currentUser.email) {
          currSearch.push(request.val().user1)
          firebase.database().ref('requests/' + request.key).remove();
        }
      })
      this.setState({
        searchUsers: currSearch
      })
    })
  }

  cancelRequest = (user) => {
    firebase.database().ref('requests/').on('value', snapshot => {
      var currSearch = this.state.searchUsers;
      snapshot.forEach(request => {
        if (request.val().user2.email === user.email && request.val().user1.email === firebase.auth().currentUser.email) {
          currSearch.push(request.val().user2)
          firebase.database().ref('requests/' + request.key).remove();
        }
      })
      this.setState({
        searchUsers: currSearch
      })
    })
  }

  rightActionsFriends = (progress, drag, name) => {
    const scale = drag.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.deleteFriend(name)}>
        <View style={styles.rightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  mapFriends = () => {
    return this.state.userFriends.map((name, index) => {
      return (
        <View key={index}>
          {/* <SwipeRow rightOpenValue={-75}>
            <View style={styles.standaloneRowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => this.deleteFriend(name)}>
                <Text style={styles.backTextWhite}>Delete</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={1} style={styles.listBody} onPress={() => this.props.navigation.navigate('Details', {user: name})}>
              <Text style={styles.textColor}>{name.name}</Text>
            </TouchableOpacity>
          </SwipeRow> */}
          <Swipeable renderRightActions={(progress, drag, name) => this.rightActionsFriends(progress, drag, name)}>
            <TouchableOpacity activeOpacity={1} style={styles.listBody} onPress={() => this.props.navigation.navigate('Details', {user: name})}>
              <Text style={styles.textColor}>{name.name}</Text>
            </TouchableOpacity>
          </Swipeable>
        </View>
      )
    })
  }

  leftActionsRequests = (progress, drag, user) => {
    const scale = drag.interpolate({
      inputRange: [0, 75],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.declineRequest(user)}>
        <View style={styles.rightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  rightActionsRequests = (progress, drag, user) => {
    const scale = drag.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.acceptRequest(user)}>
        <View style={styles.rightActionRequests}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Accept</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  mapRequests = () => {
    return this.state.incomingRequests.map((user, index) => {
      return (
        <View key={index}>
          {/* <SwipeRow rightOpenValue={-150}>
            <View style={styles.standaloneRowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => this.declineRequest(user)}>
                <Text style={styles.backTextWhite}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={() => this.acceptRequest(user)}>
                <Text style={styles.backTextWhite}>Accept</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listBody}>
              <Text style={styles.textColor}>{user.name}</Text>
            </View>
          </SwipeRow> */}
          <Swipeable renderLeftActions={(progress, drag, user) => this.leftActionsRequests(progress, drag, user)} renderRightActions={(progress, drag, user) => this.rightActionsRequests(progress, drag, user)}>
            <View style={styles.listBody}>
                <Text style={styles.textColor}>{user.name}</Text>
            </View>
          </Swipeable>
        </View>
      )
    })
  }

  rightActionsPending = (progress, drag, user) => {
    const scale = drag.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.cancelRequest(user)}>
        <View style={styles.rightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  mapPending = () => {
    return this.state.pendingRequests.map((user, index) => {
      return (
        <View key={index}>
          {/* <SwipeRow rightOpenValue={-75}>
            <View style={styles.standaloneRowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={() => this.cancelRequest(user)}>
                <Text style={styles.backTextWhite}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listBody}>
              <Text style={styles.textColor}>{user.name}</Text>
            </View>
          </SwipeRow> */}
          <Swipeable renderRightActions={(progress, drag, user) => this.rightActionsPending(progress, drag, user)}>
            <View style={styles.listBody}>
              <Text style={styles.textColor}>{user.name}</Text>
            </View>
          </Swipeable>
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
      <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .75}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <View style={styles.container}>
          <View style={styles.container1}>
            <SearchableDropdown
              onItemSelect={(friend) => {
                this.sendFriendRequest(friend)
              }}
              containerStyle={{
                width: '100%',
                // backgroundColor: '#24962c',
                // backgroundColor: 'lightblue',
                borderRadius: 5,
                // height: 50,
                // alignItems: 'center',
                // justifyContent: 'center',
                // paddingLeft: 25,
                // marginRight: 10,
                marginTop: '15%'
                // padding: 5
              }}
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
                  placeholderTextColor: 'white',
                  underlineColorAndroid: "transparent",
                  style: {
                      padding: 12,
                      borderWidth: 1,
                      borderColor: 'white',
                      // borderRadius: 5,
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
          </View>
          <ScrollView>
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'green'}}>
              <Text style={styles.textColor}>Friends</Text>
            </View>
            {this.mapFriends()}
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'orange'}}>
              <Text style={styles.textColor}>Requests</Text>
            </View>
            {this.mapRequests()}
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: 'blue'}}>
              <Text style={styles.textColor}>Pending</Text>
            </View>
            {this.mapPending()}
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
  rightAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end'
    // flex: 1
  },
  rightActionRequests: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'flex-end'
    // flex: 1
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 17
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
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
    // backgroundColor: '#24962c',
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
    // backgroundColor: 'lightblue',
    // alignItems: 'flex-end',
    // justifyContent: 'center',
  },
  container1: {
    // backgroundColor: 'lightblue',
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