import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import { Text, View } from "react-native";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import UndoSnackbar from "@/components/feedback/UndoSnackbar";
import NotesList from "@/components/notes/NoteList";
import NotesToolbar from "@/components/notes/NotesToolbar";
import RecycleSelectionBar from "@/components/notes/RecycleSelectionBar";
import ReminderList from "@/components/reminder/ReminderList";
import StickyNoteList from "@/components/sticky/StickyNoteList";
import TodoList from "@/components/todo/TodoList";
import { useRecycleScreen } from "@/hooks/useRecycleScreen";
import { useAppTheme } from "@/providers/ThemeProvider";
import { pluralize } from "@/src/utils/plural";
import Screen from "./Screen";

const TOOLBAR_HEIGHT = 56;

function BinInfoLine() {
  const { theme } = useAppTheme();
  return (
    <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
      <Text style={{ fontSize: 14, color: theme.tokens.colors.textMuted }}>
        Items show the days left until they’re deleted forever.
      </Text>
    </View>
  );
}

type DeletedItemScreenProps = {
  type: "note" | "reminder" | "sticky" | "todo";
  title: string;
  label: string;
  pluralLabel?: string;
};

export default function DeletedItemScreen({
  type,
  title,
  label,
  pluralLabel,
}: DeletedItemScreenProps) {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const {
    scrollY,
    data,
    view,
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
    totalCount,
    toggleSelect,
    toggleSelectAll,
    requestDeleteForever,
    performDeleteForever,
    cancelDelete,
    performRestoreSelected,
    handleEmptyBin,
    setUndoIds,
    setSnackOpen,
  } = useRecycleScreen(type);

  const restoredMsg =
    undoIds.length <= 1
      ? `${label.charAt(0).toUpperCase() + label.slice(1)} restored`
      : `${undoIds.length} ${pluralize(
          label,
          undoIds.length,
          pluralLabel
        )} restored`;

  const confirmMessageOverride =
    pendingIds.length > 0
      ? `${pendingIds.length} ${pluralize(
          label,
          pendingIds.length,
          pluralLabel
        )} will be permanently deleted`
      : undefined;

  return (
    <Screen>
      <NotesToolbar
        variant="sticky"
        title={title}
        scrollY={scrollY}
        selectionMode={selectionMode}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
        onRequestEdit={enterSelection}
        mode="recycle"
        onEmptyBin={handleEmptyBin}
      />

      {type === "sticky" ? (
        <StickyNoteList
          data={data as any}
          view={view as any}
          scrollY={scrollY}
          header={
            <>
              <NotesToolbar
                variant="full"
                title={title}
                total={data.length}
                noun="pin"
                scrollY={scrollY}
                selectionMode={selectionMode}
                allSelected={allSelected}
                onToggleSelectAll={toggleSelectAll}
                onRequestEdit={enterSelection}
                mode="recycle"
                onEmptyBin={handleEmptyBin}
              />
              <BinInfoLine />
            </>
          }
          contentTopInset={TOOLBAR_HEIGHT}
          onLongPressNote={handleLongPress}
          onPressNote={handlePressNote}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelectNote={toggleSelect}
          mode="recycle"
        />
      ) : type === "todo" ? (
        <TodoList
          data={data as any}
          scrollY={scrollY}
          header={
            <>
              <NotesToolbar
                variant="full"
                title={title}
                total={data.length}
                noun="list"
                scrollY={scrollY}
                selectionMode={selectionMode}
                allSelected={allSelected}
                onToggleSelectAll={toggleSelectAll}
                onRequestEdit={enterSelection}
                mode="recycle"
                onEmptyBin={handleEmptyBin}
              />
              <BinInfoLine />
            </>
          }
          contentTopInset={TOOLBAR_HEIGHT}
          onLongPressItem={handleLongPress}
          onPressItem={handlePressNote}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelectItem={toggleSelect}
          mode="recycle"
        />
      ) : type === "reminder" ? (
        <ReminderList
          data={data as any}
          scrollY={scrollY}
          header={
            <>
              <NotesToolbar
                variant="full"
                title={title}
                total={data.length}
                noun="reminder"
                scrollY={scrollY}
                selectionMode={selectionMode}
                allSelected={allSelected}
                onToggleSelectAll={toggleSelectAll}
                onRequestEdit={enterSelection}
                mode="recycle"
                onEmptyBin={handleEmptyBin}
              />
              <BinInfoLine />
            </>
          }
          contentTopInset={TOOLBAR_HEIGHT}
          onLongPressItem={handleLongPress}
          onPressItem={handlePressNote}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelectItem={toggleSelect}
          mode="recycle"
        />
      ) : (
        <NotesList
          data={data as any}
          view={view as any}
          scrollY={scrollY}
          header={
            <>
              <NotesToolbar
                variant="full"
                title={title}
                total={totalCount}
                noun="note"
                scrollY={scrollY}
                selectionMode={selectionMode}
                allSelected={allSelected}
                onToggleSelectAll={toggleSelectAll}
                onRequestEdit={enterSelection}
                mode="recycle"
                onEmptyBin={handleEmptyBin}
              />
              <BinInfoLine />
            </>
          }
          contentTopInset={TOOLBAR_HEIGHT}
          onLongPressNote={handleLongPress}
          onPressNote={handlePressNote}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelectNote={toggleSelect}
          mode="recycle"
        />
      )}

      {selectionMode && !confirmOpen && (
        <RecycleSelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onRestore={performRestoreSelected}
          onDeleteForever={requestDeleteForever}
        />
      )}

      <ConfirmDialog
        visible={confirmOpen}
        variant="permanent"
        count={pendingIds.length}
        noun={label}
        explicitPlural={pluralLabel}
        onCancel={cancelDelete}
        onConfirm={performDeleteForever}
        messageOverride={confirmMessageOverride}
      />

      <UndoSnackbar
        visible={snackOpen}
        message={restoredMsg}
        onAction={() => {
          setUndoIds([]);
          setSnackOpen(false);
        }}
        onHide={() => {
          setSnackOpen(false);
          setUndoIds([]);
        }}
      />
    </Screen>
  );
}
