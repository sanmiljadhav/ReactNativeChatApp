import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Button,
  Alert,
  ToastAndroid,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import StorageUtils from '../utils/Storage_utils'; // Import StorageUtils to get the user profile
import messaging from '@react-native-firebase/messaging';
import {getFcmToken} from '../helper/sendNotificationsHelper';
// Import styles from your styles.js

const Homescreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [loggedInUser, setLoggedInUser] = useState(null);

  const fetchUserProfile = async () => {
    // Fetch the logged-in user's profile from AsyncStorage
    const profile = await StorageUtils.getUserProfile();
    if (profile) {
      setLoggedInUser(profile);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all users from Firestore
      const snapshot = await firestore().collection('Users').get();
      const userList = snapshot.docs
        .map(doc => ({...doc.data(), id: doc.id}))
        .filter(user => user.id !== loggedInUser.id); // Exclude the logged-in user by comparing IDs

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchUsers();
      getFcmToken(loggedInUser.id);
    }

    // Foreground message listener to display notification in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Show a local notification when the app is in the foreground
      //   PushNotification.localNotification({
      //     title: remoteMessage.notification?.title,
      //     message: remoteMessage.notification?.body,
      //   });

      ToastAndroid.showWithGravity(
        `${remoteMessage.notification?.title} sent you a message: "${remoteMessage.notification?.body}"`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM, // Toast will appear at the bottom
      );
    });

    // Clean up the listener on component unmount
    return unsubscribe;
  }, [loggedInUser]); // Re-fetch users whenever loggedInUser changes

  const handleChatCtaPress = (item, loggedInUserId) => {
    // Navigate to the chat screen with the selected user
    navigation.navigate('chatscreen', {userData: item, loggedInUserId});
  };

  const handleLogout = () => {
    StorageUtils.removeAll();
    navigation.navigate('login');
  };

  return (
    <View style={homescreenStyles.mainContainer}>
      <View style={homescreenStyles.header}>
        <Text style={homescreenStyles.text_header}>Chat with Others</Text>
        <Text onPress={handleLogout} style={homescreenStyles.logoutBtn}>
          Logout
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={users}
          renderItem={({item}) => (
            <TouchableOpacity style={homescreenStyles.userItem}>
              <Text style={homescreenStyles.userText}>{item.email}</Text>
              <TouchableOpacity
                style={homescreenStyles.userChatBtn}
                onPress={() => handleChatCtaPress(item, loggedInUser.id)}>
                <Text style={homescreenStyles.userChatBtnText}>Chat</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

const homescreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  text_header: {
    color: '#420475',
    fontWeight: 'bold',
    fontSize: 30,
  },
  userItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  userText: {
    fontSize: 18,
    color: '#05375a',
  },
  activityIndicator: {
    marginTop: 20,
  },
  userChatBtn: {
    width: '70%',
    backgroundColor: '#420475',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,
    textAlign: 'center',
    marginTop: 20,
  },
  userChatBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutBtn: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Homescreen;
