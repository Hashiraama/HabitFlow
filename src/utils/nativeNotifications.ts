import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function requestNativeNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }

  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      const request = await LocalNotifications.requestPermissions();
      return request.display === 'granted';
    }
    return true;
  } catch (e) {
    console.warn('Failed to request native notification permissions:', e);
    return false;
  }
}

export async function scheduleNativeNotification(
  id: number,
  title: string,
  body: string,
  scheduledTime?: Date
) {
  const hasPermission = await requestNativeNotificationPermission();
  if (!hasPermission) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id || Math.floor(Math.random() * 100000),
            title,
            body,
            schedule: scheduledTime ? { at: scheduledTime } : undefined,
            smallIcon: 'ic_launcher',
            actionTypeId: 'HABIT_REMINDER',
          },
        ],
      });
    } catch (e) {
      console.warn('Error scheduling native local notification:', e);
    }
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
