import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Wrapper để lưu token an toàn (SecureStore chỉ chạy trên Mobile)
export const saveToken = async (token: string) => {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync('access_token', token);
  }
};

export const getToken = async () => {
  if (Platform.OS !== 'web') {
    return await SecureStore.getItemAsync('access_token');
  }
  return null;
};

export const removeToken = async () => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync('access_token');
  }
};