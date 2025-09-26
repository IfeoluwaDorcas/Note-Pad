type Listener<T> = (payload: T) => void;

function createBus<T>() {
  const subs = new Set<Listener<T>>();
  return {
    emit(payload: T) {
      subs.forEach((fn) => {
        try {
          fn(payload);
        } catch {
          /* swallow */
        }
      });
    },
    subscribe(fn: Listener<T>): () => void {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

const openReminderBus = createBus<string>();

export function emitOpenReminder(reminderId: string) {
  openReminderBus.emit(reminderId);
}

export function subscribeOpenReminder(
  cb: (reminderId: string) => void
): () => void {
  return openReminderBus.subscribe(cb);
}
