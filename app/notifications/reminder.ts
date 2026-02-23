import type { ReminderPayload } from '@/components/reminder/CreateReminderDialog';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function scheduleReminderNotification(
  p: ReminderPayload,
  rid?: string
) {
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    return { id: undefined, scheduledFor: new Date() };
  }
  const when = new Date(p.remindAt);
  const nowMs = Date.now();
  const minFire = nowMs + 5_000;
  if (when.getTime() <= nowMs) when.setTime(minFire);

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: when,
    channelId: 'reminders',
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: p.title,
      body: p.place ? `At ${p.place}` : undefined,
      sound: 'default',
      data: rid ? { reminderId: rid } : undefined,
    },
    trigger,
  });

  return { id, scheduledFor: when };
}
