import { NativeEventEmitter } from 'react-native';

const emitter = new NativeEventEmitter();
const EVT_OPEN_REMINDER = 'EVT_OPEN_REMINDER';

export function emitOpenReminder(reminderId: string) {
  emitter.emit(EVT_OPEN_REMINDER, reminderId);
}

export function subscribeOpenReminder(cb: (id: string) => void): () => void {
  const subscription = emitter.addListener(EVT_OPEN_REMINDER, cb);

  return () => {
    subscription.remove();
  };
}
