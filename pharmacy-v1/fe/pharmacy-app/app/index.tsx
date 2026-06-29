import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppSelector } from '../src/store/hooks';

export default function Index() {
  const { loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // QUAN TRỌNG: Luôn chuyển hướng vào (tabs) bất kể đã login hay chưa
  return <Redirect href="/(tabs)" />;
}