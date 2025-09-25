import type { ReminderPayload } from '@/components/reminder/CreateReminderDialog';
import * as Notifications from 'expo-notifications';

export async function scheduleReminderNotification(
  p: ReminderPayload,
  rid?: string
) {
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
