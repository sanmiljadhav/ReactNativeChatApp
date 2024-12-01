const {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} = require('react-native');

import {useEffect} from 'react';
import {Link, useNavigation} from '@react-navigation/native';
import styles from './style';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Error from 'react-native-vector-icons/MaterialIcons';
import {useState} from 'react';
import axios from 'axios';
//   import Toast from 'react-native-toast-message';
import {RadioButton} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

//import endpoints

function RegisterPage() {
  const [name, setName] = useState('');
  const [nameVerify, setNameVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileVerify, setMobileVerify] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = useNavigation();

  async function handelSubmit() {
    const userData = {
      name: name,
      email,
      mobile,
      password,
    };

    if (nameVerify && emailVerify && passwordVerify && mobileVerify) {
      try {
        const res = await firestore().collection('Users').add({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: userData.password, // You would need to hash the password before storing it
        });

        Alert.alert(`User with email ${email} has Registered Successfully`);

        setName('');
        setEmail('');
        setMobile('');
        setPassword('');
        setNameVerify(false);
        setEmailVerify(false);
        setPasswordVerify(false);
        setMobileVerify(false);
        setShowPassword(false);
        navigation.navigate('login');
      } catch (error) {
        console.log('Error in Registering User', error);
      }
    } else {
      Alert.alert('Something is missing');
    }
  }

  function handleName(e) {
    const nameVar = e.nativeEvent.text;
    setName(nameVar);
    setNameVerify(false);

    if (nameVar.length > 1) {
      setNameVerify(true);
    }
  }

  function handleEmail(e) {
    const emailVar = e.nativeEvent.text;
    setEmail(emailVar);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(emailVar)) {
      setEmail(emailVar);
      setEmailVerify(true);
    }
  }

  function handleMobile(e) {
    const mobileVar = e.nativeEvent.text;
    setMobile(mobileVar);
    setMobileVerify(false);
    if (/[6-9]{1}[0-9]{9}/.test(mobileVar)) {
      setMobile(mobileVar);
      setMobileVerify(true);
    }
  }

  function handlePassword(e) {
    const passwordVar = e.nativeEvent.text;
    setPassword(passwordVar);
    setPasswordVerify(false);
    if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(passwordVar)) {
      setPassword(passwordVar);
      setPasswordVerify(true);
    }
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigation.navigate('register');
    }

    getData();
  }, [isLoggedIn]);

  const getData = async () => {
    try {
      const users = await firestore()
        .collection('Users')
        .doc('IBmEUEAYEi8MofpEVbW2')
        .get();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={'always'}
      style={{backgroundColor: 'white'}}>
      <View>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../../assets/images/signUp.png')}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.text_header}>Register!!!</Text>

          <View style={styles.action}>
            <TextInput
              placeholder="Name"
              style={styles.textInput}
              onChange={e => handleName(e)}
              placeholderTextColor={'black'}
            />
          </View>
          {name.length < 1 ? null : nameVerify ? null : (
            <Text
              style={{
                marginLeft: 20,
                color: 'red',
              }}>
              Name sholud be more then 1 characters.
            </Text>
          )}
          <View style={styles.action}>
            <TextInput
              placeholder="Email"
              style={styles.textInput}
              onChange={e => handleEmail(e)}
              placeholderTextColor={'black'}
            />
          </View>
          {email.length < 1 ? null : emailVerify ? null : (
            <Text
              style={{
                marginLeft: 20,
                color: 'red',
              }}>
              Enter Proper Email Address
            </Text>
          )}
          <View style={styles.action}>
            <TextInput
              placeholder="Mobile"
              style={styles.textInput}
              onChange={e => handleMobile(e)}
              maxLength={10}
              placeholderTextColor={'black'}
            />
          </View>
          {mobile.length < 1 ? null : mobileVerify ? null : (
            <Text
              style={{
                marginLeft: 20,
                color: 'red',
              }}>
              Phone number with 6-9 and remaing 9 digit with 0-9
            </Text>
          )}
          <View style={styles.action}>
            <TextInput
              placeholder="Password"
              style={styles.textInput}
              onChange={e => handlePassword(e)}
              secureTextEntry={showPassword}
              placeholderTextColor={'black'}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}></TouchableOpacity>
          </View>
          {password.length < 1 ? null : passwordVerify ? null : (
            <Text
              style={{
                marginLeft: 20,
                color: 'red',
              }}>
              Uppercase, Lowercase, Number and 6 or more characters.
            </Text>
          )}
        </View>
        <View style={styles.button}>
          <TouchableOpacity style={styles.inBut} onPress={() => handelSubmit()}>
            <View>
              <Text style={styles.textSign}>Register</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>Already Registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('login')}>
              <Text
                style={{
                  fontWeight: '600',
                  color: 'blue',
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
export default RegisterPage;
