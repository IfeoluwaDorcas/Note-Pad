import { useReminderStore } from '@/src/state/reminderStore';
import { AppState } from 'react-native';

let timer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;

export function startDueWatcher(intervalMs = 30_000) {
  if (timer) return;

  const tick = () => {
    try {
      useReminderStore.getState().markDueNow();
    } catch {}
  };

  tick();

  timer = setInterval(tick, intervalMs);

  appStateSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') tick();
  });
}

export function stopDueWatcher() {
  if (timer) { clearInterval(timer); timer = null; }
  if (appStateSub) { appStateSub.remove(); appStateSub = null; }
}
