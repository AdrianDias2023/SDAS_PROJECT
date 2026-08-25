import React,{useState} from 'react';
import {View,TextInput,Button,Text} from 'react-native';
import {login} from '../services/auth';

export default function LoginScreen({navigation}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');

 async function handleLogin(){
   const result=await login(email,password);
   if(result) navigation.replace('Operator');
 }

 return (
  <View>
   <Text>SDAS Operator Login</Text>
   <TextInput placeholder="Email" onChangeText={setEmail}/>
   <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword}/>
   <Button title="Login" onPress={handleLogin}/>
  </View>
 );
}