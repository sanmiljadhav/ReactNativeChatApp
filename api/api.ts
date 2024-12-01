import axios from "axios";
export const API_BASE_URL = "http://192.168.1.4:3000/api/v1";

export const ENDPOINTS = {
  sendNotification:'/sendNotification'
  
};


export const sendNotificationApi = async (payload) => {
    try {
      // Make a POST request to send the notification
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.sendNotification}`, payload);
  
      // Return the response from the backend if successful
      return response.data;
    } catch (error) {
      // Handle any errors that occur during the API request
      console.log('Error in sending notification API:', error.response || error);
      throw error; // Propagate the error
    }
  };