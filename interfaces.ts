export interface LoggedInUser {
    email: string;
    id: string;
    mobile: string;
    name: string;
    password: string;
}


export interface User {
    email: string;
    id: string;
    mobile: string;
    name: string;
    password: string;
    fcmToken?: string;  // fcmToken is optional as not all users have it
}


export interface Message {
    message: string;
    receiverId: string;
    senderId: string;
    timestamp?: object; // You can make this more specific based on the actual timestamp format
  }