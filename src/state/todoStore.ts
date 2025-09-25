import { uid } from '@/src/utils/uid';
import { create } from 'zustand';

export type Todo = {
  id: string;
  title: string;
  note?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  order?: number;
};

type TodoState = {
  todos: Record<string, Todo>;
  addTodo: (p: { title: string }) => string;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  toggleCompleted: (id: string) => void;
  softDelete: (id: string) => void;
  restore: (id: string) => void;
  hardDelete: (id: string) => void;
  reorder: (ids: string[]) => void;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: {},

  addTodo: ({ title }) => {
    const id = uid();
    const now = new Date().toISOString();
    const current = Object.values(get().todos);
    const maxOrder = current.length ? Math.max(...current.map(t => t.order ?? 0)) : -1;
    const t: Todo = { id, title, completed: false, createdAt: now, updatedAt: now, order: maxOrder + 1 };
    set(s => ({ todos: { ...s.todos, [id]: t } }));
    return id;
  },

  updateTodo: (id, patch) =>
    set(s => {
      const prev = s.todos[id]; if (!prev) return s as any;
      return { todos: { ...s.todos, [id]: { ...prev, ...patch, updatedAt: new Date().toISOString() } } };
    }),

  toggleCompleted: (id) =>
    set(s => {
      const prev = s.todos[id]; if (!prev) return s as any;
      return { todos: { ...s.todos, [id]: { ...prev, completed: !prev.completed, updatedAt: new Date().toISOString() } } };
    }),

  softDelete: (id) =>
    set(s => {
      const prev = s.todos[id]; if (!prev || prev.deletedAt) return s as any;
      return { todos: { ...s.todos, [id]: { ...prev, deletedAt: new Date().toISOString() } } };
    }),

  restore: (id) =>
    set(s => {
      const prev = s.todos[id]; if (!prev || !prev.deletedAt) return s as any;
      const { deletedAt, ...rest } = prev as Required<Todo>;
      return { todos: { ...s.todos, [id]: { ...rest, updatedAt: new Date().toISOString() } } };
    }),

  hardDelete: (id) =>
    set(s => {
      const next = { ...s.todos }; delete next[id]; return { todos: next };
    }),

  reorder: (ids) =>
    set(s => {
      const next = { ...s.todos };
      ids.forEach((id, idx) => {
        const t = next[id]; if (t) next[id] = { ...t, order: idx, updatedAt: t.updatedAt };
      });
      return { todos: next };
    }),
}));
