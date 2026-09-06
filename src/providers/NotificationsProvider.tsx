import { PropsWithChildren, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true
  })
});

export function NotificationsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    async function requestPermission() {
      if (Platform.OS === 'web') {
        return;
      }

      try {
        const current = await Notifications.getPermissionsAsync();

        if (current.status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } catch (error) {
        console.warn('Failed to request notification permissions', error);
      }
    }

    requestPermission();
  }, []);

  return <>{children}</>;
}

export async function notifyTaskStatusChanged(title: string, statusLabel: string) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Статус задачи обновлен',
        body: `${title}: ${statusLabel}`
      },
      trigger: null
    });
  } catch (error) {
    console.warn('Failed to schedule task status notification', error);
  }
}
