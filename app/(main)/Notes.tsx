import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { useNotesStore } from '@/src/state/notesStore';
import { useUIStore } from '@/src/state/uiStore';
import { filterNotes, sortNotes } from '@/src/utils/notes';

import FAB from '@/components/common/FAB';
import UndoSnackbar from '@/components/feedback/UndoSnackbar';
import NotesList from '@/components/notes/NoteList';
import NotesToolbar from '@/components/notes/NotesToolbar';
import SelectionBar from '@/components/notes/SelectionBar';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useNotesToolbar } from '@/hooks/useNotesToolbar';
import * as Haptics from 'expo-haptics';

export default function Notes() {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const scrollY = useSharedValue(0);

  const toolbar = useNotesToolbar({ scrollY, mode: "default" });

  const { sortBy, sortDir, view, searchQuery } = useUIStore();
  const { activeNotes, softDelete, restore } = useNotesStore();
  const base = activeNotes();

  const data = useMemo(() => {
    const filtered = filterNotes(base, searchQuery);
    return sortNotes(filtered, sortBy, sortDir);
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
    setSelectedIds((prev) => {
      if (prev.size === data.length) return new Set();
      return new Set(data.map((n) => n.id));
    });
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

  const handlePressNote = useCallback(
    (id: string) => {
      if (selectionMode) {
        toggleSelect(id);
      } else {
        router.push({ pathname: "/(main)/Editor", params: { id } });
      }
    },
    [selectionMode, toggleSelect, router]
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NotesToolbar
        variant="sticky"
        title="Notes"
        scrollY={scrollY}
        controller={toolbar}
        onRequestEdit={() => enterSelection()}
        selectionMode={selectionMode}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      <NotesList
        data={data}
        view={view}
        scrollY={scrollY}
        header={
          <NotesToolbar
            variant="full"
            title="Notes"
            noun="note"
            total={data.length}
            scrollY={scrollY}
            controller={toolbar}
            onRequestEdit={() => enterSelection()}
            selectionMode={selectionMode}
            allSelected={allSelected}
            onToggleSelectAll={toggleSelectAll}
          />
        }
        contentTopInset={TOOLBAR_HEIGHT}
        onLongPressNote={handleLongPress}
        onPressNote={handlePressNote}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelectNote={toggleSelect}
      />

      {selectionMode && !confirmOpen && (
        <SelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onDelete={requestDeleteSelected}
        />
      )}

      <ConfirmDialog
        visible={confirmOpen}
        variant="recycle"
        count={pendingIds.length}
        noun="note"
        explicitPlural="notes"
        onCancel={cancelDelete}
        onConfirm={performDelete}
      />

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(main)/Editor",
            params: { id: `new-${Date.now()}` },
          })
        }
      />

      <UndoSnackbar
        visible={snackOpen}
        message={
          undoIds.length <= 1
            ? "Note moved to Recycle Bin"
            : `${undoIds.length} notes moved to Recycle Bin`
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
    </SafeAreaView>
  );
}
