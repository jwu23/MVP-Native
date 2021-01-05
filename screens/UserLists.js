
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase';
// import Accordion from 'react-native-collapsible';
import { List } from 'react-native-paper';
// import Swipeout from 'react-native-swipeout';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import { LinearGradient } from 'expo-linear-gradient';
import * as GestureHandler from 'react-native-gesture-handler';
const { Swipeable } = GestureHandler;


export default class UserLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listName: null,
      listModalVisible: false,
      userPublicLists: [],
      userPrivateLists: [],
      collapsed: true,
      itemName: null,
      itemModalVisible: false,
      switchState: false,
      switchList: 'private'
    }
  }

  componentDidMount() {
    this.getUserPublic((publicLists, privateLists) => {
      this.setState({
        userPublicLists: publicLists,
        userPrivateLists: privateLists
      })
    })

  }

  getUserPublic = (callback) => {
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + '/public').on('value', (snapshot) => {
      var publicLists = [];
      snapshot.forEach(child => {
        var temp = child.key;
        publicLists.push(temp);
      })
      this.getUserPrivate(publicLists, callback)
    })
  }

  getUserPrivate = (publicLists, callback) => {
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + '/private').on('value', (snapshot) => {
      var privateLists = [];
      snapshot.forEach(child => {
        var temp = child.key;
        privateLists.push(temp);
      })
      callback(publicLists, privateLists)
    })
  }

  openCloseListModal = () => {
    this.setState({
      listModalVisible: !this.state.listModalVisible
    })
  }

  addNewList = (listType) => {
    console.log(listType)
    if (this.state.listName !== null) {
      firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listType}/${this.state.listName}`).set('')
      setTimeout(() => {
        alert('List created')
      }, 525)
      this.setState({
        listModalVisible: !this.state.listModalVisible,
        switchState: false,
        switchList: 'private'
      })
    }
  }

  deleteList = (list, listName) => {
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${list}/${listName}`).remove();
  }

  deleteItem = (list, listName, itemKey) => {
    console.log('delete', itemKey)
    console.log('list', list)
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${list}/${listName}/` + itemKey).remove();
  }

  createItem = (list, listName) => {
    if (this.state.itemName !== null) {
      firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${list}/${listName}`).push(this.state.itemName);
      this.textInput.clear();
    }
  }

  rightActionsItem = (list, progress, drag, listName, itemKey) => {
    const scale = drag.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.deleteItem(list, listName, itemKey)}>
        <View style={styles.rightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  rightActionsList = (list, progress, drag, listName) => {
    const scale = drag.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    return (
      <TouchableOpacity onPress={() => this.deleteList(list, listName)}>
        <View style={styles.rightAction}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
        </View>
      </TouchableOpacity>
    )
  }

  mapPublicItems = (listName) => {
    var lists = [];
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/public/${listName}`).on('value', (snapshot) => {
      snapshot.forEach(child => {
        var temp = child.val();
        var itemKey = child.key;
        lists.push(
          <View key={temp}>
            <Swipeable renderRightActions={(progress, drag) => this.rightActionsItem('public', progress, drag, listName, itemKey)}>
              <View style={styles.standaloneRowFront}>
                <Text style={styles.textColor}>{temp}</Text>
              </View>
            </Swipeable>
          </View>
        );
      })
    })
    return lists;
  }

  mapPublicLists = () => {
    return this.state.userPublicLists.map((name, index) => {
      return (
        // left={img => <List.Icon icon="format-list-bulleted"/>}
        <Swipeable key={index} renderRightActions={(progress, drag) => this.rightActionsList('public', progress, drag, name)}>
          <List.Accordion title={name} theme={{ colors: { primary: 'white' }}}>
            <View style={styles.itemInputView}>
              <TextInput ref={input => { this.textInput = input }} placeholder="New Item" placeholderTextColor='white' style={styles.newItem} onChangeText={text => this.setState({itemName: text})}></TextInput>
              <TouchableOpacity style={styles.addItemButton} onPress={() => this.createItem('public', name)}>
                <Ionicons name='add' color={'white'} size={20}/>
              </TouchableOpacity>
            </View>
            {this.mapPublicItems(name)}
          </List.Accordion>
        </Swipeable>
      )
    })
  }


  mapPrivateItems = (listName) => {
    var lists = [];
    firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/private/${listName}`).on('value', (snapshot) => {
      // console.log('val', snapshot)
      snapshot.forEach(child => {
        var temp = child.val();
        var itemKey = child.key;
        lists.push(
          <View key={temp}>
            <Swipeable renderRightActions={(progress, drag) => this.rightActionsItem('private', progress, drag, listName, itemKey)}>
              <View style={styles.standaloneRowFront}>
                <Text style={styles.textColor}>{temp}</Text>
              </View>
            </Swipeable>
          </View>
        );
      })
    })
    return lists;
  }

  mapPrivateLists = () => {
    return this.state.userPrivateLists.map((name, index) => {
      return (
        // left={img => <List.Icon icon="format-list-bulleted"/>}
        <Swipeable key={index} renderRightActions={(progress, drag) => this.rightActionsList('private', progress, drag, name)}>
          <List.Accordion title={name} theme={{ colors: { primary: 'white' }}}>
            <View style={styles.itemInputView}>
              <TextInput ref={input => { this.textInput = input }} placeholder="New Item" placeholderTextColor='white' style={styles.newItem} onChangeText={text => this.setState({itemName: text})}></TextInput>
              <TouchableOpacity style={styles.addItemButton} onPress={() => this.createItem('private', name)}>
                <Ionicons name='add' color={'white'} size={20}/>
              </TouchableOpacity>
            </View>
            {this.mapPrivateItems(name)}
          </List.Accordion>
        </Swipeable>
      )
    })
  }

  toggleSwitch = () => {
    this.setState({
      switchState: !this.state.switchState,
      switchList: this.state.switchState ? 'private' : 'public'
    })
  }

  render() {
    return (
      <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .8}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
        <View style={styles.container1}>
          <TouchableOpacity style={styles.newList} onPress={this.openCloseListModal}>
            <Ionicons name='add' color={'black'} size={20}/>
            <Text>New List</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.headers}>
            <Text>Public</Text>
          </View>
            {this.mapPublicLists()}
          {/* <View>
          </View> */}
          <View style={styles.headers}>
            <Text>Private</Text>
          </View>
          {this.mapPrivateLists()}
        </ScrollView>
        <Modal animationType="fade" transparent={true} visible={this.state.listModalVisible}>
          <LinearGradient colors={['blue', 'orange']} style={{flex: 1}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
            <View style={styles.modalView}>
              <View style={styles.inputView}>
                <TextInput style={styles.inputText} placeholder="List Name" onChangeText={text => this.setState({listName: text})}>
                </TextInput>
              </View>
              <View style={styles.publicSwitch}>
                <View style={styles.publicLabel}>
                  <Text style={styles.textColor}>Public</Text>
                </View>
                <View style={{flex: 1}}>
                  <Switch
                  // trackColor={{ false: "#767577", true: "#81b0ff" }}
                  // thumbColor={this.state.switchState ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={this.toggleSwitch}
                  value={this.state.switchState}>
                  </Switch>
                </View>
              </View>
              <TouchableOpacity style={styles.newListButton} onPress={() => this.addNewList(this.state.switchList)}>
                <Text style={styles.textColor}>Create List</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.openCloseListModal}>
                <Text style={styles.textColor}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  publicLabel: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10
  },
  publicSwitch: {
    alignItems:'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headers: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30
  },
  textColor: {
    color: 'white'
  },
  rightAction: {
    backgroundColor: 'red',
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
  standaloneRowFront: {
    alignItems: 'center',
    // backgroundColor: 'lightblue',
    justifyContent: 'center',
    height: 50,
  },
  backTextWhite: {
    color: '#FFF',
  },
  listBody: {
    marginTop: 20
  },
  container: {
    flex: 1,
  },
  container1: {
    // backgroundColor: 'lightblue',
    alignItems: 'flex-end',
    // justifyContent: 'center',
  },
  newList: {
    width: '20%',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    color: 'white',
    padding: 5
  },
  addItemButton: {
    flex: 1,
    padding: 5,
  },
  modalView: {
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    paddingLeft: 75
  },
  inputText: {
    height: 50
  },
  newListButton: {
    width: '80%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  },
})































// import React from 'react';
// import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import firebase from 'firebase';
// // import Accordion from 'react-native-collapsible';
// import { List } from 'react-native-paper';
// // import Swipeout from 'react-native-swipeout';
// import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as GestureHandler from 'react-native-gesture-handler';
// const { Swipeable } = GestureHandler;


// export default class UserLists extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       listName: null,
//       listModalVisible: false,
//       userLists: [],
//       collapsed: true,
//       itemName: null,
//       itemModalVisible: false
//     }
//   }

//   componentDidMount = () => {
//     // firebase.database().ref('lists/' + firebase.auth().currentUser.uid + '/List 2').push('ifsdf')
//     firebase.database().ref('lists/' + firebase.auth().currentUser.uid).on('value', (snapshot) => {
//       var lists = [];
//       // console.log('val', snapshot)
//       snapshot.forEach(child => {
//         var temp = child.key;
//         lists.push(temp);
//       })
//       this.setState({
//         userLists: lists
//       })
//     })
//   }

//   openCloseListModal = () => {
//     this.setState({
//       listModalVisible: !this.state.listModalVisible
//     })
//   }

//   addNewList = () => {
//     console.log(firebase.auth().currentUser.uid)
//     if (this.state.listName !== null) {
//       firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${this.state.listName}`).set('')
//       setTimeout(() => {
//         alert('List created')
//       }, 525)
//       this.setState({
//         listModalVisible: !this.state.listModalVisible
//       })
//     }
//   }

//   deleteList = (listName) => {
//     console.log('listname', listName)
//     firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}`).remove();
//   }

//   deleteItem = (listName, itemKey) => {
//     console.log('delete', itemKey)
//     console.log('list', listName)
//     firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}/` + itemKey).remove();
//   }

//   createItem = (listName) => {
//     console.log(this.state.itemName)
//     if (this.state.itemName !== null) {
//       firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}`).push(this.state.itemName);
//       this.textInput.clear();
//     }
//   }

//   rightActionsItem = (progress, drag, listName, itemKey) => {
//     const scale = drag.interpolate({
//       inputRange: [-75, 0],
//       outputRange: [1, 0],
//       extrapolate: 'clamp'
//     })
//     return (
//       <TouchableOpacity onPress={() => this.deleteItem(listName, itemKey)}>
//         <View style={styles.rightAction}>
//           <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
//         </View>
//       </TouchableOpacity>
//     )
//   }

//   rightActionsList = (progress, drag, listName) => {
//     const scale = drag.interpolate({
//       inputRange: [-75, 0],
//       outputRange: [1, 0],
//       extrapolate: 'clamp'
//     })
//     return (
//       <TouchableOpacity onPress={() => this.deleteList(listName)}>
//         <View style={styles.rightAction}>
//           <Animated.Text style={[styles.actionText, { transform: [{ scale }]}]}>Delete</Animated.Text>
//         </View>
//       </TouchableOpacity>
//     )
//   }

//   mapItems = (listName) => {
//     var lists = [];
//     firebase.database().ref('lists/' + firebase.auth().currentUser.uid + `/${listName}`).on('value', (snapshot) => {
//       // console.log('val', snapshot)
//       snapshot.forEach(child => {
//         var temp = child.val();
//         var itemKey = child.key;
//         lists.push(
//           <View key={temp}>
//             <Swipeable renderRightActions={(progress, drag) => this.rightActionsItem(progress, drag, listName, itemKey)}>
//               <View style={styles.standaloneRowFront}>
//                 <Text style={styles.textColor}>{temp}</Text>
//               </View>
//             </Swipeable>
//           </View>
//         );
//       })
//     })
//     return lists;
//   }

//   mapLists = () => {
//     return this.state.userLists.map((name, index) => {
//       return (
//         // left={img => <List.Icon icon="format-list-bulleted"/>}
//         <Swipeable key={index} renderRightActions={(progress, drag) => this.rightActionsList(progress, drag, name)}>
//           <List.Accordion title={name} theme={{ colors: { primary: 'white' }}}>
//             <View style={styles.itemInputView}>
//               <TextInput ref={input => { this.textInput = input }} placeholder="New Item" placeholderTextColor='white' style={styles.newItem} onChangeText={text => this.setState({itemName: text})}></TextInput>
//               <TouchableOpacity style={styles.addItemButton} onPress={() => this.createItem(name)}>
//                 <Ionicons name='add' color={'white'} size={20}/>
//               </TouchableOpacity>
//             </View>
//             {this.mapItems(name)}
//           </List.Accordion>
//         </Swipeable>
//       )
//     })
//   }

//   render() {
//     return (
//       <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .8}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
//         <View style={styles.container1}>
//           <TouchableOpacity style={styles.newList} onPress={this.openCloseListModal}>
//             <Ionicons name='add' color={'black'} size={20}/>
//             <Text>New List</Text>
//           </TouchableOpacity>
//         </View>
//         <ScrollView>
//           <View style={styles.listBody}>
//             {this.mapLists()}
//           </View>
//         </ScrollView>
//         <Modal animationType="fade" transparent={true} visible={this.state.listModalVisible}>
//           <LinearGradient colors={['blue', 'orange']} style={{flex: 1}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
//             <View style={styles.modalView}>
//               <View style={styles.inputView}>
//                 <TextInput style={styles.inputText} placeholder="List Name" onChangeText={text => this.setState({listName: text})}>
//                 </TextInput>
//               </View>
//               <TouchableOpacity style={styles.newListButton} onPress={this.addNewList}>
//                 <Text style={styles.textColor}>Create List</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={this.openCloseListModal}>
//                 <Text style={styles.textColor}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </Modal>
//       </LinearGradient>
//     )
//   }
// }

// const styles = StyleSheet.create({
//   textColor: {
//     color: 'white'
//   },
//   rightAction: {
//     backgroundColor: 'red',
//     justifyContent: 'center',
//     alignItems: 'flex-end'
//     // flex: 1
//   },
//   actionText: {
//     color: 'white',
//     fontWeight: '600',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 17
//   },
//   standaloneRowFront: {
//     alignItems: 'center',
//     // backgroundColor: 'lightblue',
//     justifyContent: 'center',
//     height: 50,
//   },
//   backTextWhite: {
//     color: '#FFF',
//   },
//   listBody: {
//     marginTop: 20
//   },
//   container: {
//     flex: 1,
//   },
//   container1: {
//     // backgroundColor: 'lightblue',
//     alignItems: 'flex-end',
//     // justifyContent: 'center',
//   },
//   newList: {
//     width: '20%',
//     backgroundColor: '#0576ff',
//     borderRadius: 25,
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//     marginTop: 50
//   },
//   newItem: {
//     flex: 3.5,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: 'white',
//     color: 'white',
//     padding: 5
//   },
//   addItemButton: {
//     flex: 1,
//     padding: 5,
//   },
//   modalView: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: '50%',
//     height: '100%',
//   },
//   inputView: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 25,
//     height: 50,
//     marginBottom: 20,
//     justifyContent: 'center',
//     padding: 20
//   },
//   itemInputView: {
//     flexDirection: 'row',
//     paddingLeft: 75
//   },
//   inputText: {
//     height: 50
//   },
//   newListButton: {
//     width: '80%',
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: 'white',
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//     marginTop: 20
//   },
// })