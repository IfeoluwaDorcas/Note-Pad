
import { create } from 'zustand';
import { SortBy, SortDir, ViewMode } from '../types/note';

type UIState = {
  sortBy: SortBy;
  sortDir: SortDir;
  view: ViewMode;
  searchQuery: string;
  setSortBy: (v: SortBy) => void;
  toggleSortDir: () => void;
  setView: (v: ViewMode) => void;
  setSearchQuery: (q: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sortBy: 'dateCreated',
  sortDir: 'desc',
  view: 'gridM',
  searchQuery: '',
  setSortBy: (v) => set({ sortBy: v }),
  toggleSortDir: () => set((s) => ({ sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' })),
  setView: (v) => set({ view: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
