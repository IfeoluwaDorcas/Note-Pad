import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { useNotesStore } from '@/src/state/notesStore';
import { useStickyStore } from '@/src/state/stickyStore';
import { useTodoStore } from '@/src/state/todoStore';
import { useUIStore } from '@/src/state/uiStore';

import type { Todo } from '@/src/state/todoStore';
import type { Note } from '@/src/types/note';
import type { StickyNote } from '@/src/types/sticky';

const TTL_DAYS = 30;
function daysLeft(iso?: string) {
  if (!iso) return TTL_DAYS;
  const d = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  return Math.max(0, TTL_DAYS - diff);
}

export function useRecycleScreen<T extends Note | StickyNote | Todo>(
  type: 'note' | 'reminder' | 'sticky' | 'todo'
) {
  const scrollY = useSharedValue(0);

  const sortBy      = useUIStore(s => s.sortBy);
  const sortDir     = useUIStore(s => s.sortDir);
  const view        = useUIStore(s => s.view);
  const searchQuery = useUIStore(s => s.searchQuery);

  const deletedByType = useNotesStore(s => s.deletedByType);
  const restoreNote   = useNotesStore(s => s.restore);
  const purgeNote     = useNotesStore(s => s.purge);

  const restoreSticky = useStickyStore(s => s.restore);
  const purgeSticky   = useStickyStore(s => s.hardDelete);
  const stickiesMap   = useStickyStore(s => s.stickies);

  const restoreTodo = useTodoStore(s => s.restore);
  const purgeTodo   = useTodoStore(s => s.hardDelete);
  const todosMap    = useTodoStore(s => s.todos);

  const base: T[] = useMemo(() => {
    if (type === 'sticky') {
      return Object.values(stickiesMap)
        .filter(n => !!n.deletedAt)
        .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
    }
    if (type === 'todo') {
      return Object.values(todosMap)
        .filter(t => !!t.deletedAt)
        .sort((a, b) => (b.deletedAt! > a.deletedAt! ? 1 : -1)) as T[];
    }
    return deletedByType(type) as T[];
  }, [type, stickiesMap, todosMap, deletedByType]);

  const totalCount = base.length;

  const data = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase();

    const searched = q
      ? base.filter((item: any) => {
          const title = (item.title ?? '').toLowerCase();
          const body  = (item.content ?? item.note ?? '').toLowerCase();
          return title.includes(q) || body.includes(q);
        })
      : base;

    const sorted = [...searched].sort((a: any, b: any) => {
      if (sortBy === 'title') {
        return sortDir === 'asc'
          ? (a.title ?? '').localeCompare(b.title ?? '')
          : (b.title ?? '').localeCompare(a.title ?? '');
      }
      const A = (sortBy === 'dateCreated' ? a.createdAt : a.updatedAt) || '';
      const B = (sortBy === 'dateCreated' ? b.createdAt : b.updatedAt) || '';
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (B > A ? 1 : -1);
    });

    return sorted.map((item: any) => ({
      ...item,
      __daysLeft: daysLeft(item.deletedAt),
    })) as (T & { __daysLeft?: number })[];
  }, [base, searchQuery, sortBy, sortDir]);

  const visibleCount = data.length;

  useEffect(() => {
    const expired = data.filter(n => n.__daysLeft === 0);
    if (!expired.length) return;
    expired.forEach(n => {
      if (type === 'sticky') purgeSticky(n.id);
      else if (type === 'todo') purgeTodo(n.id);
      else purgeNote(n.id);
    });
  }, [data, type, purgeNote, purgeSticky, purgeTodo]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterSelection = useCallback((firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds(prev => {
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
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = selectedIds.size > 0 && selectedIds.size === visibleCount;

  const toggleSelectAll = useCallback(() => {
    if (!visibleCount) return;
    setSelectedIds(prev =>
      prev.size === visibleCount ? new Set() : new Set(data.map(n => (n as any).id))
    );
  }, [data, visibleCount]);

  const handleLongPress = useCallback(async (id: string) => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    enterSelection(id);
  }, [enterSelection]);

  const handlePressNote = useCallback((id: string) => {
    if (selectionMode) toggleSelect(id);
  }, [selectionMode, toggleSelect]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const requestDeleteForever = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setPendingIds(ids);
    setConfirmOpen(true);
  }, [selectedIds]);

  const performDeleteForever = useCallback(() => {
    pendingIds.forEach(id => {
      if (type === 'sticky') purgeSticky(id);
      else if (type === 'todo') purgeTodo(id);
      else purgeNote(id);
    });
    setConfirmOpen(false);
    exitSelection();
  }, [pendingIds, type, purgeNote, purgeSticky, purgeTodo, exitSelection]);

  const cancelDelete = useCallback(() => setConfirmOpen(false), []);

  const [undoIds, setUndoIds] = useState<string[]>([]);
  const [snackOpen, setSnackOpen] = useState(false);

  const performRestoreSelected = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    ids.forEach(id => {
      if (type === 'sticky') restoreSticky(id);
      else if (type === 'todo') restoreTodo(id);
      else restoreNote(id);
    });
    setUndoIds(ids);
    setSnackOpen(true);
    exitSelection();
  }, [selectedIds, type, restoreSticky, restoreTodo, restoreNote, exitSelection]);

  const handleEmptyBin = useCallback(() => {
    setPendingIds(data.map(n => (n as any).id));
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
