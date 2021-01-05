import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase';
// import Collapsible from 'react-native-collapsible';
// import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
// import Swipeout from 'react-native-swipeout';
// import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
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

  componentDidMount() {
    this.getUserFriends((users, friends, pending, incoming) => {
      this.setState({
        searchUsers: users,
        userFriends: friends,
        pendingRequests: pending,
        incomingRequests: incoming
      }, () => {
        this.props.setNumRequests(this.state.incomingRequests.length)
      })
    });
  }

  getSearchUsers = (pending, incoming, friends, callback) => {
    firebase.database().ref('users/').on('value', (snapshot) => {
      var users = [];
      snapshot.forEach(user => {
        const currentUser = firebase.auth().currentUser.uid;
        const uid = user.key;
        const email = user.val().email;
        const name = `${user.val().first} ${user.val().last}`
        if (uid !== currentUser) {
          var count = 0;
          for (var i = 0; i < friends.length; i++) {
            if (friends[i].email === email) {
              count++;
            }
          }
          for (var j = 0; j < pending.length; j++) {
            if (pending[j].email === email) {
              count++;
            }
          }
          for (var j = 0; j < incoming.length; j++) {
            if (incoming[j].email === email) {
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
      // this.setState({
      //   searchUsers: users,
      //   userFriends: friends,
      //   pendingRequests: pending,
      //   incomingRequests: incoming
      // }, () => {
      //   this.props.setNumRequests(this.state.incomingRequests.length)
      // })
      callback(users, friends, pending, incoming)
    })
  }

  getUserFriends = (callback) => {
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
      // this.setState({
      //   userFriends: friends
      // }, () => {
        this.getPendingRequests(friends, callback)
      // })
    })
  }

  getPendingRequests = (friends, callback) => {
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
      // this.setState({
      //   pendingRequests: pending,
      //   incomingRequests: incoming
      // }, () => {
        this.getSearchUsers(pending, incoming, friends, callback)
      // })
    })
  }

  sendFriendRequest = (friend) => {
    console.log('friend request', friend)
    console.log('user friends', this.state.userFriends)
    // console.log(firebase.auth().currentUser.email)
    var currentUserInfo = {};
    var currentEmail = firebase.auth().currentUser.email;
    var currentName = firebase.auth().currentUser.displayName;
    var currentUID = firebase.auth().currentUser.uid;
    currentUserInfo.email = currentEmail;
    currentUserInfo.name = currentName;
    currentUserInfo.uid = currentUID;
    // var currentName = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/')
    firebase.database().ref('requests/').push({user1: currentUserInfo, user2: friend})
    // .then(() => {
    //   var users = this.state.searchUsers;
    //   var removeIndex = users.map(function(user) { return user.email; }).indexOf(friend.email);
    //   users.splice(removeIndex, 1);
    //   this.setState({
    //     searchUsers: users
    //   })
    // })
  }

  deleteFriend = (name) => {
    console.log('fjlksdfjlsk', name.uid)
    firebase.database().ref('users/' + name.uid + '/friends/' + firebase.auth().currentUser.uid).remove();
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends/' + name.uid).remove()
    // .then(() => {
    //   var users = this.state.userFriends;
    //   var removeIndex = users.map(function(user) { return user.email; }).indexOf(name.email);
    //   users.splice(removeIndex, 1);
    //   this.setState({
    //     userFriends: users
    //   })
    // })
  }

  acceptRequest = (user) => {
    console.log('k;sfjs;jf;', user)
    firebase.database().ref('requests/').on('value', snapshot => {
      // console.log('snaphereeeee', snapshot)
      // var currSearch = this.state.userFriends;
      // console.log('1',currSearch)

      snapshot.forEach(request => {
        if (request.val().user1.email === user.email && request.val().user2.email === firebase.auth().currentUser.email) {
          // currSearch.push(request.val().user1)
          // console.log('pushed', request.val().user1)
          firebase.database().ref('requests/' + request.key).remove();
        }
      })
      // this.setState({
      //   userFriends: currSearch
      // })
    })
    // .then(() => {
      firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/friends/' + user.uid).set({email: user.email, name: user.name})
      firebase.database().ref('users/' + user.uid + '/friends/' + firebase.auth().currentUser.uid).set({email: firebase.auth().currentUser.email, name: firebase.auth().currentUser.displayName})
    // })
  }

  declineRequest = (user) => {
    console.log('uuusserrr', user)
    var decline = '';
    firebase.database().ref('requests/').on('value', snapshot => {
      // var currSearch = this.state.searchUsers;
      snapshot.forEach(request => {
        if (request.val().user1.email === user.email && request.val().user2.email === firebase.auth().currentUser.email) {
          // currSearch.push(request.val().user1)
          decline = request.key;
        }
      })
      // this.setState({
        //   searchUsers: currSearch
        // })
    })
    firebase.database().ref('requests/' + decline).remove();
  }

  cancelRequest = (user) => {
    var cancel = '';
    firebase.database().ref('requests/').on('value', snapshot => {
      // var currSearch = this.state.searchUsers;
      snapshot.forEach(request => {
        if (request.val().user2.email === user.email && request.val().user1.email === firebase.auth().currentUser.email) {
          // currSearch.push(request.val().user2)
          cancel = request.key;
        }
      })
      // this.setState({
        //   searchUsers: currSearch
        // })
    })
    firebase.database().ref('requests/' + cancel).remove();
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
          <Swipeable renderRightActions={(progress, drag) => this.rightActionsFriends(progress, drag, name)}>
            <TouchableOpacity activeOpacity={1} style={styles.friendSection} onPress={() => this.props.navigation.navigation.navigate('Details', {user: name})}>
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
          <Swipeable renderLeftActions={(progress, drag) => this.leftActionsRequests(progress, drag, user)} renderRightActions={(progress, drag) => this.rightActionsRequests(progress, drag, user)}>
            <View style={styles.friendSection}>
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
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Cancel</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  mapPending = () => {
    return this.state.pendingRequests.map((user, index) => {
      return (
        <View key={index}>
          <Swipeable renderRightActions={(progress, drag) => this.rightActionsPending(progress, drag, user)}>
            <View key={index} style={styles.friendSection}>
              <Text style={styles.textColor}>{user.name}</Text>
            </View>
          </Swipeable>
        </View>
      )
    })
  }

  render() {
    return (
      <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .8}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
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
                  nestedScrollEnabled: true,
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
  friendSection: {
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
})