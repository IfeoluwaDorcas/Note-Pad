import { Note } from '@/src/types/note';
import { uid } from '@/src/utils/uid';
import { create } from 'zustand';

function firstLine(str: string) {
  const line = (str || '').split(/\r?\n/)[0]?.trim() ?? '';
  return line || 'Untitled';
}

type NotesState = {
  notes: Note[];
  activeNotes: () => Note[];
  deletedNotes: () => Note[];
  deletedByType: (type: Note['type']) => Note[];
  getById: (id: string) => Note | undefined;
  createEmpty: (type?: Note['type']) => Note;
  add: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Note;
  update: (id: string, patch: Partial<Note>) => void;
  softDelete: (id: string) => void;
  restore: (id: string) => void;
  purge: (id: string) => void;
  purgeAll: () => void;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],

  activeNotes: () => get().notes.filter(n => !n.deletedAt),
  deletedNotes: () => get().notes.filter(n => !!n.deletedAt),
  deletedByType: (type) => get().notes.filter(n => n.deletedAt && n.type === type),
  getById: (id) => get().notes.find(n => n.id === id),

  createEmpty: (type = 'note') => {
    const now = new Date().toISOString();
    return {
      id: uid(),
      title: 'Untitled',
      content: '',
      type,
      createdAt: now,
      updatedAt: now,
    };
  },

  add: (n) => {
    const now = new Date().toISOString();
    const id = n.id ?? uid();
    const title = n.title ?? firstLine(n.content ?? '');
    const newNote: Note = {
      id,
      title,
      content: n.content ?? '',
      previewImage: n.previewImage,
      createdAt: now,
      updatedAt: now,
      type: n.type ?? 'note',
      subtitle: n.subtitle,
      pinned: n.pinned,
      categoryId: n.categoryId,
    };
    set(s => ({ notes: [...s.notes, newNote] }));
    return newNote;
  },

  update: (id, patch) => set(s => ({
    notes: s.notes.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, ...patch };
      if ('content' in patch && !('title' in patch)) {
        merged.title = firstLine(patch.content ?? '');
      }
      return { ...merged, updatedAt: new Date().toISOString() };
    }),
  })),

  softDelete: (id) => set(s => ({
    notes: s.notes.map(n => n.id === id ? { ...n, deletedAt: new Date().toISOString() } : n),
  })),

  restore: (id) => set(s => ({
    notes: s.notes.map(n => n.id === id ? (() => {
      const { deletedAt, ...rest } = n;
      return { ...rest, updatedAt: new Date().toISOString() };
    })() : n),
  })),

  purge: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
  purgeAll: () => set(s => ({ notes: s.notes.filter(n => !n.deletedAt) })),
}));
