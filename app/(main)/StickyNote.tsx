import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useSharedValue } from "react-native-reanimated";

import { useNotesToolbar } from "@/hooks/useNotesToolbar";
import { useStickyStore } from "@/src/state/stickyStore";
import { useUIStore } from "@/src/state/uiStore";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import UndoSnackbar from "@/components/feedback/UndoSnackbar";
import NotesToolbar from "@/components/notes/NotesToolbar";
import SelectionBar from "@/components/notes/SelectionBar";

import FAB from "@/components/common/FAB";
import Screen from "@/components/Screen";
import CreateStickyDialog, {
  StickyPayload,
} from "@/components/sticky/StickyNoteDialog";
import StickyNoteList from "@/components/sticky/StickyNoteList";

export default function StickyNotes() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const scrollY = useSharedValue(0);
  const toolbar = useNotesToolbar({ scrollY, mode: "default" });

  const sortBy = useUIStore((s) => s.sortBy);
  const sortDir = useUIStore((s) => s.sortDir);
  const view = useUIStore((s) => s.view);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const addSticky = useStickyStore((s) => s.addSticky);
  const updateSticky = useStickyStore((s) => s.updateSticky);
  const softDelete = useStickyStore((s) => s.softDelete);
  const restore = useStickyStore((s) => s.restore);

  const stickies = useStickyStore((s) => s.stickies);

  const base = useMemo(() => {
    return Object.values(stickies)
      .filter((n) => !n.deletedAt)
      .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }, [stickies]);
  const data = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase();
    const filtered = !q
      ? base
      : base.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        );
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title")
        return sortDir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      const A = (sortBy === "dateCreated" ? a.createdAt : a.updatedAt) || "";
      const B = (sortBy === "dateCreated" ? b.createdAt : b.updatedAt) || "";
      return sortDir === "asc" ? (A > B ? 1 : -1) : B > A ? 1 : -1;
    });
    return sorted;
  }, [base, searchQuery, sortBy, sortDir]);

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

  useFocusEffect(
    useCallback(() => {
      return () => exitSelection();
    }, [exitSelection])
  );

  useLayoutEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!selectionMode) return;
      e.preventDefault();
      exitSelection();
    });
    return sub;
  }, [navigation, selectionMode, exitSelection]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = selectedIds.size > 0 && selectedIds.size === data.length;
  const toggleSelectAll = useCallback(() => {
    if (!data.length) return;
    setSelectedIds((prev) =>
      prev.size === data.length ? new Set() : new Set(data.map((n) => n.id))
    );
  }, [data]);

  const handleLongPress = useCallback(
    async (id: string) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      enterSelection(id);
    },
    [enterSelection]
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openEditFor = useCallback((id: string) => {
    setEditingId(id);
    setEditOpen(true);
  }, []);
  const handlePressNote = useCallback(
    (id: string) => {
      if (selectionMode) toggleSelect(id);
      else openEditFor(id);
    },
    [selectionMode, toggleSelect, openEditFor]
  );

  const handleCreate = useCallback(
    (p: StickyPayload) => addSticky(p),
    [addSticky]
  );
  const handleUpdate = useCallback(
    (p: StickyPayload) => {
      if (editingId) updateSticky(editingId, p);
    },
    [editingId, updateSticky]
  );

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
    if (!pendingIds.length) {
      setConfirmOpen(false);
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    pendingIds.forEach((id) => softDelete(id));
    setUndoIds(pendingIds);
    setSnackOpen(true);
    setConfirmOpen(false);
    exitSelection();
  }, [pendingIds, softDelete, exitSelection]);

  const cancelDelete = useCallback(() => setConfirmOpen(false), []);

  const TOOLBAR_HEIGHT = 56;
  const editing = editingId ? data.find((n) => n.id === editingId) : undefined;

  return (
    <Screen>
      <NotesToolbar
        variant="sticky"
        title="Sticky Notes"
        scrollY={scrollY}
        controller={toolbar}
        onRequestEdit={() => enterSelection()}
        selectionMode={selectionMode}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      <StickyNoteList
        data={data}
        view={view as any}
        scrollY={scrollY}
        contentTopInset={TOOLBAR_HEIGHT}
        header={
          <NotesToolbar
            variant="full"
            title="Sticky Notes"
            noun="pin"
            total={data.length}
            scrollY={scrollY}
            controller={toolbar}
            onRequestEdit={() => enterSelection()}
            selectionMode={selectionMode}
            allSelected={allSelected}
            onToggleSelectAll={toggleSelectAll}
          />
        }
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelectNote={toggleSelect}
        onLongPressNote={handleLongPress}
        onPressNote={handlePressNote}
      />

      {selectionMode && !confirmOpen && (
        <SelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onDelete={requestDeleteSelected}
        />
      )}

      {createOpen && (
        <CreateStickyDialog
          key="create"
          visible
          mode="create"
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {editOpen && (
        <CreateStickyDialog
          key="edit"
          visible
          mode="edit"
          initial={
            editing
              ? {
                  title: editing.title,
                  content: editing.content,
                  color: editing.color,
                }
              : undefined
          }
          onClose={() => {
            setEditOpen(false);
            setEditingId(null);
          }}
          onUpdate={handleUpdate}
          confirmLabel="Save"
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
          visible={confirmOpen}
          variant="recycle"
          count={pendingIds.length}
          noun="sticky note"
          explicitPlural="sticky notes"
          onCancel={cancelDelete}
          onConfirm={performDelete}
        />
      )}

      <FAB onPress={() => setCreateOpen(true)} />

      {/*
      <UndoSnackbar
        visible={snackOpen}
        message={
          undoIds.length <= 1
            ? "Sticky moved to Recycle Bin"
            : `${undoIds.length} stickies moved to Recycle Bin`
        }
        onAction={() => {
          undoIds.forEach((id) => restore(id));
          setSnackOpen(false);
        }}
        onHide={() => {
          setSnackOpen(false);
          setUndoIds([]);
        }}
      />
      */}
    </Screen>
  );
}
