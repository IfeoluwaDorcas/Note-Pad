import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { useNotesToolbar } from '@/hooks/useNotesToolbar';
import { useTodoStore } from '@/src/state/todoStore';
import { useUIStore } from '@/src/state/uiStore';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import UndoSnackbar from '@/components/feedback/UndoSnackbar';
import SelectionBar from '@/components/notes/SelectionBar';

import FAB from '@/components/common/FAB';
import NotesToolbar from '@/components/notes/NotesToolbar';
import CreateTodoDialog, { TodoPayload } from '@/components/todo/CreateTodoDialog';
import TodoList from '@/components/todo/TodoList';

export default function TodoListScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const scrollY = useSharedValue(0);
  const toolbar = useNotesToolbar({ scrollY, mode: 'default' });

  const sortBy      = useUIStore(s => s.sortBy);
  const sortDir     = useUIStore(s => s.sortDir);
  const searchQuery = useUIStore(s => s.searchQuery);

  const todos            = useTodoStore(s => s.todos);
  const addTodo          = useTodoStore(s => s.addTodo);
  const updateTodo       = useTodoStore(s => s.updateTodo);
  const toggleCompleted  = useTodoStore(s => s.toggleCompleted);
  const softDelete       = useTodoStore(s => s.softDelete);
  const restore          = useTodoStore(s => s.restore);

  const base = useMemo(() => {
    return Object.values(todos)
      .filter(t => !t.deletedAt)
      .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }, [todos]);

  const data = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase();
    const filtered = !q
      ? base
      : base.filter(t =>
          t.title.toLowerCase().includes(q) ||
          (t.note ?? '').toLowerCase().includes(q)
        );
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'title')
        return sortDir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);

      const A = (sortBy === 'dateCreated' ? a.createdAt : a.updatedAt) || '';
      const B = (sortBy === 'dateCreated' ? b.createdAt : b.updatedAt) || '';
      return sortDir === 'asc' ? (A > B ? 1 : -1) : (B > A ? 1 : -1);
    });
    return sorted;
  }, [base, searchQuery, sortBy, sortDir]);

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

  const allSelected = selectedIds.size > 0 && selectedIds.size === data.length;
  const toggleSelectAll = useCallback(() => {
    if (!data.length) return;
    setSelectedIds(prev =>
      prev.size === data.length ? new Set() : new Set(data.map(t => t.id))
    );
  }, [data]);

  const handleLongPress = useCallback(async (id: string) => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    enterSelection(id);
  }, [enterSelection]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openEditFor = useCallback((id: string) => { setEditingId(id); setEditOpen(true); }, []);
  const handlePressItem = useCallback((id: string) => {
    if (selectionMode) toggleSelect(id);
    else openEditFor(id);
  }, [selectionMode, toggleSelect, openEditFor]);

  const handleCreate = useCallback((p: TodoPayload) => addTodo(p), [addTodo]);
  const handleUpdate = useCallback((p: TodoPayload) => {
    if (editingId) updateTodo(editingId, p);
  }, [editingId, updateTodo]);

  const [undoIds, setUndoIds] = useState<string[]>([]);
  const [snackOpen, setSnackOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const requestDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setPendingIds(ids);
    setConfirmOpen(true);
  }, [selectedIds]);

  const performDelete = useCallback(() => {
    if (!pendingIds.length) { setConfirmOpen(false); return; }
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    pendingIds.forEach(id => softDelete(id));
    setUndoIds(pendingIds);
    setSnackOpen(true);
    setConfirmOpen(false);
    exitSelection();
  }, [pendingIds, softDelete, exitSelection]);

  const cancelDelete = useCallback(() => setConfirmOpen(false), []);

  const TOOLBAR_HEIGHT = 56;
  const editing = editingId ? data.find(t => t.id === editingId) : undefined;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NotesToolbar
        variant="sticky"
        title="To-Do List"
        scrollY={scrollY}
        controller={toolbar}
        onRequestEdit={() => enterSelection()}
        selectionMode={selectionMode}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
        enableViewMenu={false}
        searchPlaceholder="Search to-dos"
      />

      <TodoList
        data={data}
        scrollY={scrollY}
        contentTopInset={TOOLBAR_HEIGHT}
        header={
          <NotesToolbar
            variant="full"
            title="To-Do List"
            noun='list'
            total={data.length}
            scrollY={scrollY}
            controller={toolbar}
            onRequestEdit={() => enterSelection()}
            selectionMode={selectionMode}
            allSelected={allSelected}
            onToggleSelectAll={toggleSelectAll}
            enableViewMenu={false}
            searchPlaceholder="Search to-dos"
          />
        }
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelectItem={toggleSelect}
        onLongPressItem={handleLongPress}
        onPressItem={handlePressItem}
        onToggleDone={toggleCompleted}
      />

      {selectionMode && !confirmOpen && (
        <SelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onDelete={requestDeleteSelected}
        />
      )}

      {createOpen && (
        <CreateTodoDialog
          key="create"
          visible
          mode="create"
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {editOpen && (
        <CreateTodoDialog
          key="edit"
          visible
          mode="edit"
          initial={editing ? { title: editing.title } : undefined}
          onClose={() => { setEditOpen(false); setEditingId(null); }}
          onUpdate={handleUpdate}
          confirmLabel="Save"
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
  visible={confirmOpen}
  variant="recycle"
  count={pendingIds.length}
  noun="to-do"
  explicitPlural="to-dos"
  onCancel={cancelDelete}
  onConfirm={performDelete}
/>

      )}

      <FAB onPress={() => setCreateOpen(true)} />

      <UndoSnackbar
        visible={snackOpen}
        message={undoIds.length <= 1 ? 'To-do moved to Recycle Bin' : `${undoIds.length} to-dos moved to Recycle Bin`}
        onAction={() => { undoIds.forEach(id => restore(id)); setSnackOpen(false); }}
        onHide={() => { setSnackOpen(false); setUndoIds([]); }}
      />
    </SafeAreaView>
  );
}
