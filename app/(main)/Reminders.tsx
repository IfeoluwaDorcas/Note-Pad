import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSharedValue } from "react-native-reanimated";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import FAB from "@/components/common/FAB";
import UndoSnackbar from "@/components/feedback/UndoSnackbar";
import NotesToolbar from "@/components/notes/NotesToolbar";
import SelectionBar from "@/components/notes/SelectionBar";
import CreateReminderDialog, {
  ReminderPayload,
} from "@/components/reminder/CreateReminderDialog";
import ReminderList from "@/components/reminder/ReminderList";
import Screen from "@/components/Screen";
import { useNotesToolbar } from "@/hooks/useNotesToolbar";
import { useReminderStore } from "@/src/state/reminderStore";
import { useUIStore } from "@/src/state/uiStore";
import { subscribeOpenReminder } from "../notifications/bus";
import { scheduleReminderNotification } from "../notifications/reminder";

export default function Reminders() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const scrollY = useSharedValue(0);
  const toolbar = useNotesToolbar({ scrollY, mode: "default" });

  const sortBy = useUIStore((s) => s.sortBy);
  const sortDir = useUIStore((s) => s.sortDir);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const all = useReminderStore((s) => s.reminders);
  const addReminder = useReminderStore((s) => s.addReminder);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const toggleCompleted = useReminderStore((s) => s.toggleCompleted);
  const softDelete = useReminderStore((s) => s.softDelete);
  const restore = useReminderStore((s) => s.restore);

  const base = useMemo(
    () =>
      Object.values(all)
        .filter((r) => !r.deletedAt)
        .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)),
    [all]
  );

  const data = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase();
    const filtered = !q
      ? base
      : base.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.place ?? "").toLowerCase().includes(q)
        );
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title")
        return sortDir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      const A = sortBy === "dateCreated" ? a.createdAt : a.updatedAt;
      const B = sortBy === "dateCreated" ? b.createdAt : b.updatedAt;
      return sortDir === "asc" ? (A > B ? 1 : -1) : B > A ? 1 : -1;
    });
    return sorted;
  }, [base, searchQuery, sortBy, sortDir]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const enterSelection = useCallback((firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds((p) => {
      const n = new Set(p);
      if (firstId) n.add(firstId);
      return n;
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
    setSelectedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);
  const allSelected = selectedIds.size > 0 && selectedIds.size === data.length;
  const toggleSelectAll = useCallback(() => {
    if (!data.length) return;
    setSelectedIds((p) =>
      p.size === data.length ? new Set() : new Set(data.map((r) => r.id))
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
  const handlePressItem = useCallback(
    (id: string) => {
      if (selectionMode) toggleSelect(id);
      else openEditFor(id);
    },
    [selectionMode, toggleSelect, openEditFor]
  );

  useEffect(() => {
    const unsub = subscribeOpenReminder((rid) => {
      setEditingId(rid);
      setEditOpen(true);
    });

    return () => {
      unsub && unsub();
    };
  }, []);

  const handleCreate = useCallback(
    async (p: ReminderPayload) => {
      const id = addReminder(p);
      try {
        await scheduleReminderNotification(p, id);
      } catch {}
      return id;
    },
    [addReminder]
  );

  const handleUpdate = useCallback(
    (p: ReminderPayload) => {
      if (editingId) updateReminder(editingId, p);
    },
    [editingId, updateReminder]
  );

  const handleToggleDone = useCallback(
    async (id: string) => {
      const before = useReminderStore.getState().reminders[id];
      const wasDaily =
        before?.repeat === "daily" && before?.completed === false;

      toggleCompleted(id);

      if (wasDaily) {
        const after = useReminderStore.getState().reminders[id];
        if (after) {
          try {
            await scheduleReminderNotification(
              {
                title: after.title,
                place: after.place,
                remindAt: after.remindAt,
              },
              id
            );
          } catch {}
        }
      }
    },
    [toggleCompleted]
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
  const editing = editingId ? data.find((r) => r.id === editingId) : undefined;
  const editingInitial = editing
    ? {
        title: editing.title,
        place: editing.place,
        remindAt: editing.remindAt,
        timeHHmm: new Date(editing.remindAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        repeat: editing.repeat ?? "none",
      }
    : undefined;

  return (
    <Screen>
      <NotesToolbar
        variant="sticky"
        title="Reminders"
        scrollY={scrollY}
        controller={toolbar}
        onRequestEdit={() => enterSelection()}
        selectionMode={selectionMode}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
        enableViewMenu={false}
        searchPlaceholder="Search reminders"
      />

      <ReminderList
        data={data}
        scrollY={scrollY}
        contentTopInset={TOOLBAR_HEIGHT}
        header={
          <NotesToolbar
            variant="full"
            title="Reminders"
            noun="reminder"
            total={data.length}
            scrollY={scrollY}
            controller={toolbar}
            onRequestEdit={() => enterSelection()}
            selectionMode={selectionMode}
            allSelected={allSelected}
            onToggleSelectAll={toggleSelectAll}
            enableViewMenu={false}
            searchPlaceholder="Search reminders"
          />
        }
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelectItem={toggleSelect}
        onLongPressItem={handleLongPress}
        onPressItem={handlePressItem}
        onToggleDone={handleToggleDone}
      />

      {selectionMode && !confirmOpen && (
        <SelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onDelete={requestDeleteSelected}
        />
      )}

      {createOpen && (
        <CreateReminderDialog
          key="create"
          visible
          mode="create"
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {editOpen && (
        <CreateReminderDialog
          key="edit"
          visible
          mode="edit"
          initial={editingInitial}
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
          noun="reminder"
          explicitPlural="reminders"
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
            ? "Reminder moved to Recycle Bin"
            : `${undoIds.length} reminders moved to Recycle Bin`
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
