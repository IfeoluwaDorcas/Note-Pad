import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SortBy, SortDir, ViewMode } from "../types/note";

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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sortBy: "dateCreated",
      sortDir: "desc",
      view: "gridM",
      searchQuery: "",
      setSortBy: (v) => set({ sortBy: v }),
      toggleSortDir: () =>
        set((s) => ({ sortDir: s.sortDir === "asc" ? "desc" : "asc" })),
      setView: (v) => set({ view: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (s) => ({
        sortBy: s.sortBy,
        sortDir: s.sortDir,
        view: s.view,
        searchQuery: s.searchQuery,
      }),
    }
  )
);
