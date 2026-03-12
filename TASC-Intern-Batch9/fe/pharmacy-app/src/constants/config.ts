import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android' 
  ? 'https://31ctlfc4-8080.jpe1.devtunnels.ms/api/v1' 
  : 'http://localhost:8080/api/v1';

export const AUTH_TOKEN_KEY = 'pharmacy_auth_token';