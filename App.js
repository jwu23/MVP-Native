import * as React from 'react';
import { View, Text } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoadingScreen from './screens/LoadingScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import DashboardScreen from './screens/DashboardScreen.js';

import * as firebase from 'firebase';
import { firebaseConfig } from './config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen:LoadingScreen,
  LoginScreen:LoginScreen,
  RegisterScreen:RegisterScreen,
  DashboardScreen:DashboardScreen,
});

const AppNavigator = createAppContainer(AppSwitchNavigator);


class App extends React.Component {
  render() {
    return (
      <AppNavigator/>
    );
  }
}

export default App;


// import * as React from 'react';
// import { View, Text } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from './screens/LoginScreen.js';
// import Register from './screens/Register.js';

// const Stack = createStackNavigator();



// function App({ navigation }) {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login">
//         <Stack.Screen name="Login" component={LoginScreen} navigation={navigation}/>
//         <Stack.Screen name="Register" component={Register} navigation={}/>
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default App;