import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [navigatorReady, setNavigatorReady] = useState(false);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      setNavigatorReady(true);
    });
    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (!navigatorReady || isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)' as Href);
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as Href);
    }
  }, [navigatorReady, isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="light" />
      <Toast />
    </AuthProvider>
  );
}
