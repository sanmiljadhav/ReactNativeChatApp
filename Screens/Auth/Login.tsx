import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './style';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Error from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore'; // Firestore import
import StorageUtils from '../../utils/Storage_utils';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [emailVerify, setEmailVerify] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordVerify, setPasswordVerify] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigation = useNavigation();

  // Handle form submission
  async function handelSubmit() {
    if (emailVerify && passwordVerify) {
      try {
        // Query Firestore to check if the email exists
        const userSnapshot = await firestore()
          .collection('Users') // Replace 'Users' with your Firestore collection name
          .where('email', '==', email)
          .where('password', '==', password) // Assuming you're storing password directly (not recommended)
          .get();

        // Check if a user document exists
        if (!userSnapshot.empty) {
          // If user is found
          const userDoc = userSnapshot.docs[0].data();
          const userId = userSnapshot.docs[0].id;
          console.log('User found:', userDoc);

          const userProfile = {
            id: userId, // Add the document ID
            email: userDoc.email,
            mobile: userDoc.mobile,
            name: userDoc.name,
            password: userDoc.password,
          };
          await StorageUtils.setUserProfile(userProfile);

          // Navigate to home or dashboard
          navigation.navigate('home');
        } else {
          // If no matching user, alert user
          Alert.alert(
            'Invalid credentials',
            'Please check your email and password.',
          );
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Login failed', error.message);
      }
    } else {
      Alert.alert('Please fill all fields correctly.');
    }
  }

  // Email validation
  function handleEmail(e) {
    const emailVar = e.nativeEvent.text;
    setEmail(emailVar);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(emailVar)) {
      setEmail(emailVar);
      setEmailVerify(true);
    }
  }

  // Password validation
  function handlePassword(e) {
    const passwordVar = e.nativeEvent.text;
    setPassword(passwordVar);
    setPasswordVerify(false);
    if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(passwordVar)) {
      setPassword(passwordVar);
      setPasswordVerify(true);
    }
  }

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
          <Text style={styles.text_header}>Login!!!</Text>
          <View style={styles.action}>
            <TextInput
              placeholder="Enter Email"
              style={styles.textInput}
              onChange={e => handleEmail(e)}
              placeholderTextColor={'black'}
            />
          </View>
          {email.length < 1 ? null : emailVerify ? null : (
            <Text style={{marginLeft: 20, color: 'red'}}>
              Enter Proper Email Address
            </Text>
          )}

          <View style={styles.action}>
            <TextInput
              placeholder="Enter Password"
              style={styles.textInput}
              onChange={e => handlePassword(e)}
              secureTextEntry={showPassword}
              placeholderTextColor={'black'}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}></TouchableOpacity>
          </View>
          {password.length < 1 ? null : passwordVerify ? null : (
            <Text style={{marginLeft: 20, color: 'red'}}>
              Uppercase, Lowercase, Number and 6 or more characters.
            </Text>
          )}
        </View>

        <View style={styles.button}>
          <TouchableOpacity style={styles.inBut} onPress={() => handelSubmit()}>
            <View>
              <Text style={styles.textSign}>Login</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 16}}>Havent Registered Yet? Click on</Text>
            <TouchableOpacity onPress={() => navigation.navigate('register')}>
              <Text
                style={{
                  fontWeight: '600',
                  color: 'blue',
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default Login;
