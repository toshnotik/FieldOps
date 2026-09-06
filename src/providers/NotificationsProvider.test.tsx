import * as Notifications from 'expo-notifications';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NotificationsProvider, notifyTaskStatusChanged } from './NotificationsProvider';

const mockedNotifications = jest.mocked(Notifications);

describe('NotificationsProvider', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as Notifications.NotificationPermissionsStatus);
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as Notifications.NotificationPermissionsStatus);
    mockedNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('handles notification permission request failures', async () => {
    mockedNotifications.getPermissionsAsync.mockRejectedValueOnce(new Error('permission unavailable'));

    render(
      <NotificationsProvider>
        <Text>content</Text>
      </NotificationsProvider>
    );

    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to request notification permissions',
        expect.any(Error)
      )
    );
  });

  it('handles notification scheduling failures', async () => {
    mockedNotifications.scheduleNotificationAsync.mockRejectedValueOnce(new Error('schedule unavailable'));

    await expect(notifyTaskStatusChanged('Ремонт оборудования', 'Готово')).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('Failed to schedule task status notification', expect.any(Error));
  });
});
