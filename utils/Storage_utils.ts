import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  
  USER_PROFILE: 'user_profile',
};

type UserProfile = {
  
  email: string;
  mobile: string;
  name: string;
  password:string;
  
};

const StorageUtils = {
  // Get the API token from storage
 

  

  // Get the user profile from storage
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userProfile ? JSON.parse(userProfile) : null;
    } catch (e) {
      console.error('Error getting user profile', e);
      return null;
    }
  },

  // Set the user profile in storage
  setUserProfile: async (user: UserProfile): Promise<void> => {
    //  {"email": "parth@gmail.com", "id": "NGnPFFYCTN7yvQspcv3M", "mobile": "9309847899", "name": "parth", "password": "Parth$10"}
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (e) {
      console.error('Error setting user profile', e);
    }
  },

  // Remove all stored auth data
  removeAll: async (): Promise<void> => {
    try {
     
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  },
};

export default StorageUtils;