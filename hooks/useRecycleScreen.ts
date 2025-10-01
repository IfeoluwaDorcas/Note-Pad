import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

import { useUIStore } from "@/src/state/uiStore";

import { useNotesStore } from "@/src/state/notesStore";
import type { Note } from "@/src/types/note";

import { useStickyStore } from "@/src/state/stickyStore";
import type { StickyNote } from "@/src/types/sticky";

import type { Todo } from "@/src/state/todoStore";
import { useTodoStore } from "@/src/state/todoStore";

import type { Reminder } from "@/src/state/reminderStore";
import { useReminderStore } from "@/src/state/reminderStore";

const TTL_DAYS = 30;

function daysLeft(iso?: string) {
  if (!iso) return TTL_DAYS;
  const deletedAtMs = new Date(iso).getTime();
  const diffDays = Math.floor(
    (Date.now() - deletedAtMs) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, TTL_DAYS - diffDays);
}

type Kind = "note" | "reminder" | "sticky" | "todo";
type AnyItem = Note | StickyNote | Todo | Reminder;

export function useRecycleScreen<T extends AnyItem>(type: Kind) {
  const scrollY = useSharedValue(0);

  const sortBy = useUIStore((s) => s.sortBy);
  const sortDir = useUIStore((s) => s.sortDir);
  const view = useUIStore((s) => s.view);
  const searchQuery = useUIStore((s) => s.searchQuery);

  // --- stores ---
  const notesMap = useNotesStore((s) => s.notes); // FIX: track notes directly
  const restoreNote = useNotesStore((s) => s.restore);
  const purgeNote = useNotesStore((s) => s.purge);

  const stickiesMap = useStickyStore((s) => s.stickies);
  const restoreSticky = useStickyStore((s) => s.restore);
  const purgeSticky = useStickyStore((s) => s.hardDelete);

  const todosMap = useTodoStore((s) => s.todos);
  const restoreTodo = useTodoStore((s) => s.restore);
  const purgeTodo = useTodoStore((s) => s.hardDelete);

  const remindersMap = useReminderStore((s) => s.reminders);
  const restoreReminder = useReminderStore((s) => s.restore);
  const purgeReminder = useReminderStore((s) => s.hardDelete);

  // --- base data depending on type ---
  const base: T[] = useMemo(() => {
    if (type === "sticky") {
      return Object.values(stickiesMap)
        .filter((n) => !!n.deletedAt)
        .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
    }
    if (type === "todo") {
      return Object.values(todosMap)
        .filter((t) => !!t.deletedAt)
        .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
    }
    if (type === "reminder") {
      return Object.values(remindersMap)
        .filter((r) => !!r.deletedAt)
        .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
    }
    // notes
    return Object.values(notesMap)
      .filter((n: any) => !!n.deletedAt)
      .sort((a: any, b: any) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
  }, [type, notesMap, stickiesMap, todosMap, remindersMap]);

  const totalCount = base.length;

  // --- filtered & sorted data ---
  const data = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase();

    const searched = q
      ? base.filter((item: any) => {
          const title = (item.title ?? "").toLowerCase();
          const body = (item.content ?? item.note ?? "").toLowerCase();
          return title.includes(q) || body.includes(q);
        })
      : base;

    const sorted = [...searched].sort((a: any, b: any) => {
      if (sortBy === "title") {
        const A = (a.title ?? "") as string;
        const B = (b.title ?? "") as string;
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }
      const A = (sortBy === "dateCreated" ? a.createdAt : a.updatedAt) || "";
      const B = (sortBy === "dateCreated" ? b.createdAt : b.updatedAt) || "";
      return sortDir === "asc" ? (A > B ? 1 : -1) : B > A ? 1 : -1;
    });

    return sorted.map((item: any) => ({
      ...item,
      __daysLeft: daysLeft(item.deletedAt),
    })) as (T & { __daysLeft?: number })[];
  }, [base, searchQuery, sortBy, sortDir]);

  const visibleCount = data.length;

  // --- auto purge expired ---
  useEffect(() => {
    const expired = data.filter((n) => n.__daysLeft === 0);
    if (!expired.length) return;

    expired.forEach((n: any) => {
      if (type === "sticky") purgeSticky(n.id);
      else if (type === "todo") purgeTodo(n.id);
      else if (type === "reminder") purgeReminder(n.id);
      else purgeNote(n.id);
    });
  }, [data, type, purgeNote, purgeSticky, purgeTodo, purgeReminder]);

  // --- selection state ---
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterSelection = useCallback((firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (firstId) next.add(firstId);
      return next;
    });
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = selectedIds.size > 0 && selectedIds.size === visibleCount;

  const toggleSelectAll = useCallback(() => {
    if (!visibleCount) return;
    setSelectedIds((prev) =>
      prev.size === visibleCount
        ? new Set()
        : new Set(data.map((n: any) => n.id))
    );
  }, [data, visibleCount]);

  // --- interactions ---
  const handleLongPress = useCallback(
    async (id: string) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      enterSelection(id);
    },
    [enterSelection]
  );

  const handlePressNote = useCallback(
    (id: string) => {
      if (selectionMode) toggleSelect(id);
    },
    [selectionMode, toggleSelect]
  );

  // --- delete confirmation ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const requestDeleteForever = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setPendingIds(ids);
    setConfirmOpen(true);
  }, [selectedIds]);

  const performDeleteForever = useCallback(() => {
    pendingIds.forEach((id) => {
      if (type === "sticky") purgeSticky(id);
      else if (type === "todo") purgeTodo(id);
      else if (type === "reminder") purgeReminder(id);
      else purgeNote(id);
    });
    setConfirmOpen(false);
    setPendingIds([]); // clear after action
    exitSelection();
  }, [
    pendingIds,
    type,
    purgeNote,
    purgeSticky,
    purgeTodo,
    purgeReminder,
    exitSelection,
  ]);

  const cancelDelete = useCallback(() => setConfirmOpen(false), []);

  // --- restore ---
  const [undoIds, setUndoIds] = useState<string[]>([]);
  const [snackOpen, setSnackOpen] = useState(false);

  const performRestoreSelected = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    ids.forEach((id) => {
      if (type === "sticky") restoreSticky(id);
      else if (type === "todo") restoreTodo(id);
      else if (type === "reminder") restoreReminder(id);
      else restoreNote(id);
    });
    setUndoIds(ids);
    setSnackOpen(true);
    exitSelection();
  }, [
    selectedIds,
    type,
    restoreSticky,
    restoreTodo,
    restoreReminder,
    restoreNote,
    exitSelection,
  ]);

  const handleEmptyBin = useCallback(() => {
    if (!data.length) return;
    setPendingIds(data.map((n: any) => n.id));
    setConfirmOpen(true);
  }, [data]);

  return {
    scrollY,
    data,
    view,
    totalCount,
    visibleCount,
    selectionMode,
    selectedIds,
    allSelected,
    undoIds,
    snackOpen,
    confirmOpen,
    pendingIds,
    handlePressNote,
    handleLongPress,
    enterSelection,
    exitSelection,
    toggleSelect,
    toggleSelectAll,
    requestDeleteForever,
    performDeleteForever,
    cancelDelete,
    performRestoreSelected,
    handleEmptyBin,
    setUndoIds,
    setSnackOpen,
  };
}
