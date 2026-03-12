import "../global.css";
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Provider } from 'react-redux';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { store } from '../src/store';
import { getToken } from '../src/utils/storage';
import { setToken, fetchUserProfile, logoutUser } from '../src/store/authSlice';
import { useAppDispatch } from '../src/store/hooks';

function AppContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkSession = async () => {
      const token = await getToken();
      if (!token) {
        dispatch(logoutUser()); 
      } else {
        dispatch(setToken(token));
        dispatch(fetchUserProfile());
      }
    };
    checkSession();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[slug]"
        options={{
          headerShown: true, 
          title: 'Chi tiết sản phẩm',
          headerBackTitle: 'Trở lại',
          headerStatusBarHeight: insets.top,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}