import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'fieldops.accessToken';

export async function saveAccessToken(token: string) {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    return;
  }

  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return;
  }

  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}
