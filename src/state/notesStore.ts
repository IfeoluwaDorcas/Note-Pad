import { Note } from "@/src/types/note";
import { uid } from "@/src/utils/uid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function firstLineFromHtml(html: string) {
  const txt = (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?(div|p|br)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .split(/\r?\n/)[0]
    .trim();
  return txt || "Untitled";
}

type NotesState = {
  notes: Note[];
  activeNotes: () => Note[];
  deletedNotes: () => Note[];
  deletedByType: (type: Note["type"]) => Note[];
  getById: (id: string) => Note | undefined;
  createEmpty: (type?: Note["type"]) => Note;
  add: (
    n: Omit<Note, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => Note;
  update: (id: string, patch: Partial<Note>) => void;
  softDelete: (id: string) => void;
  restore: (id: string) => void;
  purge: (id: string) => void;
  purgeAll: () => void;
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      activeNotes: () => get().notes.filter((n) => !n.deletedAt),
      deletedNotes: () => get().notes.filter((n) => !!n.deletedAt),
      deletedByType: (type) =>
        get().notes.filter((n) => n.deletedAt && n.type === type),
      getById: (id) => get().notes.find((n) => n.id === id),

      createEmpty: (type = "note") => {
        const now = new Date().toISOString();
        return {
          id: uid(),
          title: "Untitled",
          content: "",
          type,
          createdAt: now,
          updatedAt: now,
        };
      },

      add: (n) => {
        const now = new Date().toISOString();
        const id = n.id ?? uid();
        const content = n.content ?? "";
        const title =
          (n.title && n.title.trim().length
            ? n.title
            : firstLineFromHtml(content)) || "Untitled";
        const newNote: Note = {
          id,
          title,
          content,
          previewImage: n.previewImage,
          createdAt: now,
          updatedAt: now,
          type: n.type ?? "note",
          subtitle: n.subtitle,
          pinned: n.pinned,
          categoryId: n.categoryId,
        };
        set((s) => {
          const withoutDup = s.notes.filter((x) => x.id !== id);
          return { notes: [...withoutDup, newNote] };
        });
        return newNote;
      },

      update: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => {
            if (n.id !== id) return n;
            const merged = { ...n, ...patch };
            if ("content" in patch && !("title" in patch)) {
              const keepExisting =
                merged.title &&
                merged.title.trim().length &&
                merged.title !== "Untitled";
              if (!keepExisting)
                merged.title = firstLineFromHtml(patch.content ?? "");
            }
            return { ...merged, updatedAt: new Date().toISOString() };
          }),
        })),

      softDelete: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, deletedAt: new Date().toISOString() } : n
          ),
        })),

      restore: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? (() => {
                  const { deletedAt, ...rest } = n as any;
                  return { ...rest, updatedAt: new Date().toISOString() };
                })()
              : n
          ),
        })),

      purge: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      purgeAll: () =>
        set((s) => ({ notes: s.notes.filter((n) => !n.deletedAt) })),
    }),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (s) => ({ notes: s.notes }),
    }
  )
);
