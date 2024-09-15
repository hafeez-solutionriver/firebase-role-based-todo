import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function LoginScreen({ navigation }) {

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
    useEffect(()=>{

      async function redirect() {
        try{
          const role = await AsyncStorage.getItem('role');
          const userId = await AsyncStorage.getItem('userId');
       
          if (role!=null) {
            navigation.navigate('Dashboard', { role,userId });
          }
         
        }
         catch (error) {
          // Error retrieving data
          console.log(error)
          }
      }
    
       redirect();
    },[])
  const handleLogin = async () => {
    const auth = getAuth();
    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Fetch the user's role from the Firebase Realtime Database
      const db = getDatabase();
      const roleRef = ref(db, `users/${userId}/role`);
      const roleSnapshot = await get(roleRef);

      if (roleSnapshot.exists()) {
        const role = roleSnapshot.val();
        try {
          await AsyncStorage.setItem(
            'role',role
          );
          await AsyncStorage.setItem(
            'userId',userId
          );
        } catch (error) {
          // Error saving data
          console.log(error)
        }
     navigation.navigate('Dashboard',{userId,role})
      } else {
        alert('No role found for the user');
      }
    } catch (error) {
      alert('Invalid email or password');
      console.log('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      
   
      <Text style={styles.header}>Team To-Do List</Text>
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
      <Button title="Login" onPress={handleLogin} style={styles.logIn}/>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Sign up</Text>
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
  logIn:{
    backgroundColor:'blue'
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
    borderRadius: 4
  },
  link: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 16,
  },
  footerLink: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 8,
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
});
