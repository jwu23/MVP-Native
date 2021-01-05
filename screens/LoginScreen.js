import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';
import { LinearGradient } from 'expo-linear-gradient';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: ''
    }
  }

  handleLogin = () => {
    try {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((user) => {
          this.props.navigation.navigate('DashboardScreen');
        })
        .catch((err) => {
          let code = err.code;
          if (this.state.email === '') {
            this.onLoginFail('Please enter an email')
          } else if (code === 'auth/user-not-found') {
            this.onLoginFail('There is no account with this email.')
          } else if (code === 'auth/invalid-email') {
            this.onLoginFail('Email is invalid')
          } else {
            this.onLoginFail('Email/Password combination is incorrect')
          }
        })
    }
    catch (err) {
      console.log(err.toString());
    }
  }

  onLoginFail = (errorMessage) => {
    this.setState({
      error: errorMessage
    })
  }

  handleSignUp = () => {
    this.props.navigation.navigate('RegisterScreen');
  }

  render() {
    return (
    <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .8}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View>
          <Text style={styles.logo}>ListMe</Text>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder='Email' placeholderTextColor='white' onChangeText={text => this.setState({email: text})}></TextInput>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder='Password' placeholderTextColor='white' secureTextEntry onChangeText={text => this.setState({password: text})}></TextInput>
        </View>
        <Text>{this.state.error}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={this.handleLogin}>
          <Text style={styles.textColor}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleSignUp}>
          <Text style={styles.textColor}>Don't have an account? Register</Text>
        </TouchableOpacity>
        <StatusBar style='auto' />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 50,
    color: '#f7d4a3',
    marginBottom: 40
  },
  inputView: {
    width: '80%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20
  },
  inputText: {
    height: 50,
    color: 'white'
  },
  textColor: {
    color: 'white'
  },
  loginButton: {
    width: '80%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  }
});
