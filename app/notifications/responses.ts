import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { emitOpenReminder } from './bus';

export function useNotificationResponses() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { reminderId?: string };
      router.navigate('/Reminders');
      if (data?.reminderId) emitOpenReminder(data.reminderId);
    });
    return () => sub.remove();
  }, []);
}
