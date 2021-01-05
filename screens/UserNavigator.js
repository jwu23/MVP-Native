import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Badge } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import UserLists from './UserLists.js';
import UserFriends from './UserFriends.js';
import SignOutScreen from './SignOutScreen.js';
import FriendNavigator from './FriendNavigator.js';

const Tab = createMaterialBottomTabNavigator();

export default class UserNavigator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numRequests: null
    }
  }

  setNumRequests = (count) => {
    if (count !== 0) {
      this.setState({
        numRequests: count
      })
    } else {
      this.setState({
        numRequests: null
      })
    }
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator shifting={true}>
          <Tab.Screen name="Lists" component={UserLists} options={{
            tabBarIcon: ({color}) => (
              <Ionicons name="list-outline" color={color} size={25}/>
            ),
            tabBarColor: '#0576ff'
          }}/>
          <Tab.Screen name="Friends" children={() => <FriendNavigator setNumRequests={this.setNumRequests}/>} options={{
            tabBarIcon: ({color}) => (
              <Ionicons name="people-outline" color={color} size={25}/>
            ),
            tabBarColor: 'orange',
            tabBarBadge: this.state.numRequests
          }}/>
          <Tab.Screen name='Account' component={SignOutScreen} options={{
            tabBarIcon: ({color}) => (
              <Ionicons name="settings-outline" color={color} size={25}/>
            ),
            tabBarColor: 'green'
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}