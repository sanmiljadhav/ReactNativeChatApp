import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useRoute} from '@react-navigation/native';
import StorageUtils from '../utils/Storage_utils';
import {sendPushNotificationToReceiver} from '../helper/sendNotificationsHelper';
import { combineTransition } from 'react-native-reanimated';
import { User } from '../interfaces';
import { Message } from '../interfaces';

export default function Chatscreen() {

  interface RouteParams {
    userData: User;
    loggedInUserId: string | null | undefined; // loggedInUserId will be of type string
  }

  const route = useRoute();
  const {userData, loggedInUserId} = route.params as RouteParams; // Get recipient data from navigation params
  const [recipient, setRecipientData] = useState<User>(userData);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatId, setChatId] = useState<string | null>(null);
  const navigation = useNavigation();

  const recipientId = recipient.id;


  // Generate a unique chat ID using user IDs (to maintain consistent chat for two users)
  const generateChatId = (user1Id, user2Id) => {
    return [user1Id, user2Id].sort().join('_');
  };

  // Function to create a new chat and set up chat metadata
  const createNewChat = async () => {
    const id = generateChatId(loggedInUserId, recipientId);
    setChatId(id);

    // Check if the chat already exists
    const chatSnapshot = await firestore().collection('Chats').doc(id).get();

    if (!chatSnapshot.exists) {
      try {
        // Create a new chat document in 'Chats' collection if it doesn't exist
        await firestore().collection('Chats').doc(id).set({
          user1_id: loggedInUserId,
          user2_id: recipientId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastMessage: '',
          lastMessageTime: firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.log('Error creating new chat:', error);
      }
    }
  };

  // Function to fetch chat messages from Firestore
  const fetchChatMessages = async () => {
    try {
      const chatRef = firestore()
        .collection('Chats')
        .doc(chatId)
        .collection('Messages');

      // Fetch messages ordered by timestamp in descending order (latest first)
      const snapshot = await chatRef.orderBy('timestamp').get();
      const chatMessages = snapshot.docs.map(doc => doc.data());

      setMessages(chatMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  // Function to send a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return; // Don't send empty messages

    const messageData = {
      senderId: loggedInUserId,
      receiverId: recipientId,
      message: newMessage,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    try {
      // Add the new message to the Messages subcollection
      await firestore()
        .collection('Chats')
        .doc(chatId)
        .collection('Messages')
        .add(messageData);

      // Update the last message in the Chats document
      await firestore().collection('Chats').doc(chatId).update({
        lastMessage: messageData.message,
        lastMessageTime: messageData.timestamp,
      });

      // Clear input field and refresh messages
      setNewMessage('');
      fetchChatMessages();
      sendPushNotificationToReceiver(
        messageData.message,
        recipientId,
        loggedInUserId,
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    createNewChat();
  }, [recipient]);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages();
    }
  }, [chatId]); // Fetch messages only after chat ID is set

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={styles.chatContainer}>
        <Text style={styles.chatHeader}>
          Chat with <Text style={styles.chatHeaderEmail}>{userData.email}</Text>
        </Text>

        {/* Display chat messages */}
        <FlatList
          data={messages}
          renderItem={({item}) => (
            <View
              style={[
                styles.messageContainer,
                item.senderId === loggedInUserId
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      {/* Input field for sending new messages */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style = {styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  chatHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatHeaderEmail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#420475',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#420475',
    color: 'white',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'green',
    color: 'black',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingLeft: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#420475',
    padding: 10,
    borderRadius: 50,
  },
  sendBtnText:{
    color:'white',
    fontWeight:'bold'
  }
});
