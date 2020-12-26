import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: null,
      lastName: null,
      email: null,
      password1: null,
      password2: null,
      error: ''
    }
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  onRegisterFail = (errorMessage) => {
    this.setState({
      error: errorMessage
    })
  }

  handleSignUp = async () => {
    try {
      if (this.state.firstName === null || this.state.lastName === null || this.state.email === null || this.state.password1 === null || this.state.password2 === null) {
        // alert('Please fill out all fields');
        this.onRegisterFail.bind(this)('Please fill out all fields')
        // return;
      } else if (this.state.password1 !== this.state.password2) {
        // alert('Passwords must match');
        this.onRegisterFail.bind(this)('Passwords must match')
        // return;
      } else {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password1).then((cred) => {
          console.log(cred.user.uid)
          firebase.database().ref('users/' + cred.user.uid).set({
            first: this.state.firstName,
            last: this.state.lastName,
            email: this.state.email
          })
        })
        alert('Account Created');
      }
    }
    catch (err) {
      console.log(err.toString())
    }
  }

  backToLogin = () => {
    this.props.navigation.navigate('LoginScreen');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create An Account</Text>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="First Name" onChangeText={text => this.setState({firstName: text})}></TextInput>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Last Name" onChangeText={text => this.setState({lastName: text})}></TextInput>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder=" Email" onChangeText={text => this.setState({email: text})}></TextInput>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Password" secureTextEntry onChangeText={text => this.setState({password1: text})}></TextInput>
        </View>
        <View style={styles.inputView}>
          <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Re-Enter Password" secureTextEntry onChangeText={text => this.setState({password2: text})}></TextInput>
        </View>
        <Text>{this.state.error}</Text>
        <TouchableOpacity style={styles.registerButton} onPress={this.handleSignUp}>
          <Text>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.backToLogin}>
          <Text>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 50,
    color: '#f7d4a3',
    marginBottom: 40,
    textAlign: 'center'
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
  inputText: {
    height: 50
  },
  registerButton: {
    width: '80%',
    backgroundColor: 'green',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  }
})