import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { AppQueryProvider } from '@/providers/QueryProvider';
import { colors } from '@/shared/ui/theme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

function RootNavigator() {
  const { token, isBootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!token && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [inAuthGroup, isBootstrapping, router, token]);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ title: 'Задача' }} />
      <Stack.Screen name="task/create" options={{ title: 'Новая задача' }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}
