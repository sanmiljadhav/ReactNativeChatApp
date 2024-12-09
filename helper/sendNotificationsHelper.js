import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {sendNotificationApi} from '../api/api';

export const getFcmToken = async userId => {
  try {
    // Request permission for notifications (iOS)
    await messaging().requestPermission();

    // Get the FCM token for the device
    const fcmToken = await messaging().getToken();

    console.log("Fcm token is", fcmToken)

    if (fcmToken) {
      // Store the FCM token in Firestore for the user
      await firestore().collection('Users').doc(userId).update({
        fcmToken: fcmToken, // Store the FCM token in Firestore
      });
    } else {
      console.log('No FCM token found');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Fetch recipient's FCM token
const getRecipientToken = async recipientId => {
  try {
    const recipientDoc = await firestore()
      .collection('Users')
      .doc(recipientId)
      .get();
    const recipientData = recipientDoc.data();
    return recipientData?.fcmToken; // Get the fcmToken from the user's document
  } catch (error) {
    console.error('Error fetching recipient FCM token:', error);
  }
};

// Function to send push notification to the receiver
export const sendPushNotificationToReceiver = async (
  message,
  recipientId,
  senderId,
) => {
  try {
    const recipientToken = await getRecipientToken(recipientId);

    if (recipientToken) {

      const senderDoc = await firestore()
        .collection('Users')
        .doc(senderId)
        .get();
      const senderData = senderDoc.data();
      const senderEmail = senderData?.email || 'Unknown Sender'; // Use 'Unknown Sender' if name is not found

      const payload = {
        token: recipientToken, // Token to send the notification to
        message: message, // The message content for the notification
        senderEmail: senderEmail
      };

      const response = await sendNotificationApi(payload);
    } else {
      console.log('Recipient FCM token not found.');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// FCM TOKEN IS e4pryvAsTk2ZfQH5bCu-m3:APA91bGKNHv7KMKEzR_2HCWEOQsr-drRPgq_8Ck1hcKOlpLgdYxSfp10Syr14G9b5aiHaMNsvnMNlTfZvr9F6E8TipdGpasDw-3oU0R2OP_Zw4lJhl9Bi-o (Parth - mom)

//FCM TOKEN IS d1ngp4ddQ6idJ6H5YU_Csw:APA91bElo07ghQgUUpAwmocBUwUqnJN_JpiTp9hkPdCwq1UUN-5duusmDTfl_ArW2uDwyNwajX0SsWg-AHuCm-_eCMDi7SIqx2a9Rh2JFOR0mEK6KdbLpzk (chickoo - me)
