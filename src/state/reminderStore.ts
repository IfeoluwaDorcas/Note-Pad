import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const isPast = (iso: string, nowMs = Date.now()) => {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t + 60_000 <= nowMs : false;
};

export type Repeat = "none" | "daily";

export type Reminder = {
  id: string;
  title: string;
  place?: string;
  remindAt: string;
  repeat?: Repeat;
  completed: boolean;
  completedAt?: string;
  due: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  order?: number;
};

type AddPayload = {
  title: string;
  place?: string;
  remindAt: string;
  repeat?: Repeat;
};

type ReminderState = {
  reminders: Record<string, Reminder>;
  activeReminders: () => Reminder[];
  recycledReminders: () => Reminder[];
  addReminder: (p: AddPayload) => string;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  toggleCompleted: (id: string) => void;
  softDelete: (id: string) => void;
  restore: (id: string) => void;
  hardDelete: (id: string) => void;
  reorder: (ids: string[]) => void;
  markDueNow: () => void;
};

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: {},

      activeReminders: () => {
        const all = Object.values(get().reminders);
        return all
          .filter((r) => !r.deletedAt)
          .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
      },

      recycledReminders: () => {
        const all = Object.values(get().reminders);
        return all
          .filter((r) => !!r.deletedAt)
          .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1));
      },

      addReminder: ({ title, place, remindAt, repeat = "none" }) => {
        const id = Math.random().toString(36).slice(2);
        const now = new Date().toISOString();
        const current = Object.values(get().reminders);
        const maxOrder = current.length
          ? Math.max(...current.map((r) => r.order ?? 0))
          : -1;

        const r: Reminder = {
          id,
          title,
          place,
          remindAt,
          repeat,
          completed: false,
          completedAt: undefined,
          due: isPast(remindAt),
          createdAt: now,
          updatedAt: now,
          order: maxOrder + 1,
        };
        set((s) => ({ reminders: { ...s.reminders, [id]: r } }));
        return id;
      },

      updateReminder: (id, patch) =>
        set((s) => {
          const prev = s.reminders[id];
          if (!prev) return s as any;
          const merged: Reminder = { ...prev, ...patch };
          if (patch.remindAt !== undefined || patch.completed !== undefined) {
            merged.due = !merged.completed && isPast(merged.remindAt);
          }
          merged.updatedAt = new Date().toISOString();
          return { reminders: { ...s.reminders, [id]: merged } };
        }),

      toggleCompleted: (id) =>
        set((s) => {
          const prev = s.reminders[id];
          if (!prev) return s as any;

          if (prev.repeat === "daily" && !prev.completed) {
            const d = new Date(prev.remindAt);
            d.setDate(d.getDate() + 1);
            const rolled: Reminder = {
              ...prev,
              remindAt: d.toISOString(),
              completed: false,
              completedAt: undefined,
              due: false,
              updatedAt: new Date().toISOString(),
            };
            return { reminders: { ...s.reminders, [id]: rolled } };
          }

          const completed = !prev.completed;
          const next: Reminder = {
            ...prev,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            due: completed ? false : isPast(prev.remindAt),
            updatedAt: new Date().toISOString(),
          };
          return { reminders: { ...s.reminders, [id]: next } };
        }),

      softDelete: (id) =>
        set((s) => {
          const prev = s.reminders[id];
          if (!prev || prev.deletedAt) return s as any;
          return {
            reminders: {
              ...s.reminders,
              [id]: {
                ...prev,
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      restore: (id) =>
        set((s) => {
          const prev = s.reminders[id];
          if (!prev || !prev.deletedAt) return s as any;
          const { deletedAt, ...rest } = prev as Required<Reminder>;
          const due = !rest.completed && isPast(rest.remindAt);
          return {
            reminders: {
              ...s.reminders,
              [id]: { ...rest, due, updatedAt: new Date().toISOString() },
            },
          };
        }),

      hardDelete: (id) =>
        set((s) => {
          const next = { ...s.reminders };
          delete next[id];
          return { reminders: next };
        }),

      reorder: (ids) =>
        set((s) => {
          const next = { ...s.reminders };
          ids.forEach((id, idx) => {
            const r = next[id];
            if (r) next[id] = { ...r, order: idx, updatedAt: r.updatedAt };
          });
          return { reminders: next };
        }),

      markDueNow: () => {
        const nowMs = Date.now();
        set((s) => {
          const next = { ...s.reminders };
          let changed = false;
          for (const id of Object.keys(next)) {
            const r = next[id];
            if (r.deletedAt) continue;
            const newDue = !r.completed && isPast(r.remindAt, nowMs);
            if (newDue !== r.due) {
              next[id] = { ...r, due: newDue, updatedAt: r.updatedAt };
              changed = true;
            }
          }
          return changed ? { reminders: next } : s;
        });
      },
    }),
    {
      name: "reminders-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      partialize: (s) => ({ reminders: s.reminders }),
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        const src = persisted.reminders ?? {};
        const fixed: typeof src = {};
        for (const id of Object.keys(src)) {
          const r = src[id];
          fixed[id] = { ...r, due: !r.completed && isPast(r.remindAt) };
        }
        return { ...persisted, reminders: fixed };
      },
      onRehydrateStorage: () => (state) => {
        try {
          state?.markDueNow?.();
        } catch {}
      },
    }
  )
);
