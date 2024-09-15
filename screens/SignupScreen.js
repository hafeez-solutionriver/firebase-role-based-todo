import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC6-rDQLQqsEZU--4CgKWGxHczNOtV1Z0w',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://todo-c673f-default-rtdb.firebaseio.com/',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'com.todo',
  measurementId: 'G-measurement-id',
};

// Check if Firebase has already been initialized
let app, auth;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  app = getApps()[0]; // Use the already initialized app
}

const database = getDatabase(app);

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Member'); // Default to 'Member'

  const createUser = async (response) => {
    //get unique key from firebase
    const userId = response.user.uid;
    const userData = {
      name: name,
      email: email,
      role:role
    };

    //initialize user with its data along with empty assignedTasks
      set(ref(database, `/users/${userId}`), {
        ...userData,
        assignedTasks: []  
      });
  
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      if (response.user) {
        await createUser(response);
        navigation.navigate('Login');  
      }
    } catch (e) {
      console.log('Error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Team To-Do List</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Text style={styles.roleText}>Select a Role</Text>
      <Picker
        selectedValue={role}
        style={styles.input}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="Admin" value="Admin" />
        <Picker.Item label="Member" value="Member" />
      </Picker>
      <Button title="Sign up" onPress={handleSignup} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.footerLink}>Already have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  link: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 16,
  },
  roleText:{
    fontSize:15,
    marginLeft:8
  },
  footerLink: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 8,
  },
});
