import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';
import { LinearGradient } from 'expo-linear-gradient';

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
  }

  handleSignUp = () => {
    try {
      if (this.state.firstName === null || this.state.lastName === null || this.state.email === null || this.state.password1 === null || this.state.password2 === null) {
        this.onRegisterFail('Please fill out all fields')
      } else if (this.state.password1 !== this.state.password2) {
        this.onRegisterFail('Passwords must match')
      } else {
        try {
          firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password1)
          .then((cred) => {
            console.log(cred.user.uid)
            cred.user.updateProfile({
              displayName: `${this.state.firstName} ${this.state.lastName}`
            })
            firebase.database().ref('users/' + cred.user.uid).set({
              first: this.state.firstName,
              last: this.state.lastName,
              email: this.state.email
            })
            alert('Account Created');
          })
          .catch((err) => {
            let code = err.code;
            if (code === 'auth/invalid-email') {
              this.onRegisterFail('Email is invalid')
            } else if (code === 'auth/weak-password') {
              this.onRegisterFail('Password must be at least 6 characters')
            }
          })
        }
        catch (err) {
          console.log(err.toString())
        }
      }
    }
    catch (err) {
      console.log(err.toString())
    }
  }

  onRegisterFail = (errorMessage) => {
    this.setState({
      error: errorMessage
    })
  }

  backToLogin = () => {
    this.props.navigation.navigate('LoginScreen');
  }

  render() {
    return (
      <LinearGradient colors={['blue', 'orange']} style={{flex: 1, opacity: .75}} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}>
        <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={styles.container}>
          <View>
            <Text style={styles.title}>Create An Account</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="First Name" placeholderTextColor='white' onChangeText={text => this.setState({firstName: text})}></TextInput>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Last Name" placeholderTextColor='white' onChangeText={text => this.setState({lastName: text})}></TextInput>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder=" Email" placeholderTextColor='white' onChangeText={text => this.setState({email: text})}></TextInput>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Password" placeholderTextColor='white' secureTextEntry onChangeText={text => this.setState({password1: text})}></TextInput>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputText} autoCorrect={false} autoCapitalize = 'none' placeholder="Re-Enter Password" placeholderTextColor='white' secureTextEntry onChangeText={text => this.setState({password2: text})}></TextInput>
          </View>
          <Text>{this.state.error}</Text>
          <TouchableOpacity style={styles.registerButton} onPress={this.handleSignUp}>
            <Text style={styles.textColor}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.backToLogin}>
            <Text style={styles.textColor}>Already have an account? Login</Text>
          </TouchableOpacity>
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
    // backgroundColor: 'lightblue'
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
    // backgroundColor: 'white',
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
  registerButton: {
    width: '80%',
    // backgroundColor: 'green',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20
  }
})