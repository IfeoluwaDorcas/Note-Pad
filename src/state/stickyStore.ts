import type { StickyNote } from "@/src/types/sticky";
import { uid } from "@/src/utils/uid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AddPayload = { title: string; content: string; color: string };

type StickyState = {
  stickies: Record<string, StickyNote>;
  addSticky: (p: AddPayload) => string;
  updateSticky: (id: string, patch: Partial<StickyNote>) => void;
  softDelete: (id: string) => void;
  restore: (id: string) => void;
  hardDelete: (id: string) => void;
  activeStickies: () => StickyNote[];
  recycledStickies: () => StickyNote[];
};

export const useStickyStore = create<StickyState>()(
  persist(
    (set, get) => ({
      stickies: {},

      addSticky: ({ title, content, color }) => {
        const id = uid();
        const now = new Date().toISOString();
        const note: StickyNote = {
          id,
          title,
          content,
          color,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ stickies: { ...s.stickies, [id]: note } }));
        return id;
      },

      updateSticky: (id, patch) => {
        set((s) => {
          const prev = s.stickies[id];
          if (!prev) return s as any;
          const updated: StickyNote = {
            ...prev,
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          return { stickies: { ...s.stickies, [id]: updated } };
        });
      },

      softDelete: (id) =>
        set((s) => {
          const prev = s.stickies[id];
          if (!prev || prev.deletedAt) return s as any;
          return {
            stickies: {
              ...s.stickies,
              [id]: { ...prev, deletedAt: new Date().toISOString() },
            },
          };
        }),

      restore: (id) =>
        set((s) => {
          const prev = s.stickies[id];
          if (!prev || !prev.deletedAt) return s as any;
          const { deletedAt, ...rest } = prev as Required<StickyNote>;
          return {
            stickies: {
              ...s.stickies,
              [id]: { ...rest, updatedAt: new Date().toISOString() },
            },
          };
        }),

      hardDelete: (id) =>
        set((s) => {
          const next = { ...s.stickies };
          delete next[id];
          return { stickies: next };
        }),

      activeStickies: () => {
        const all = Object.values(get().stickies);
        return all
          .filter((n) => !n.deletedAt)
          .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
      },

      recycledStickies: () => {
        const all = Object.values(get().stickies);
        return all
          .filter((n) => !!n.deletedAt)
          .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1));
      },
    }),
    {
      name: "stickies-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (s) => ({ stickies: s.stickies }),
    }
  )
);
