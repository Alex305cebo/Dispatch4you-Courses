/**
 * Thin wrapper around the browser Notification API. Used for an optional
 * local streak reminder shown when the learner opens the app. There is no
 * backend push — these only appear while the app can run, so we keep the
 * promise honest and degrade gracefully where unsupported or not permitted.
 */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function showLocalNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/dispatch-academy-app/icon.svg',
    });
  } catch {
    /* construction can throw in some embedded contexts — ignore */
  }
}
