import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import UndoSnackbar from '@/components/feedback/UndoSnackbar';
import NotesList from '@/components/notes/NoteList';
import NotesToolbar from '@/components/notes/NotesToolbar';
import RecycleSelectionBar from '@/components/notes/RecycleSelectionBar';
import StickyNoteList from '@/components/sticky/StickyNoteList';
import TodoList from '@/components/todo/TodoList';
import { useRecycleScreen } from '@/hooks/useRecycleScreen';
import { useAppTheme } from '@/providers/ThemeProvider';

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
  type: 'note' | 'reminder' | 'sticky' | 'todo';
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

  const plural = pluralLabel ?? `${label}s`;

  const restoredMsg =
    undoIds.length <= 1
      ? `${label.charAt(0).toUpperCase() + label.slice(1)} restored`
      : `${undoIds.length} ${plural} restored`;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Sticky toolbar (compact) */}
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

      {/* Content */}
      {type === 'sticky' ? (
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
      ) : type === 'todo' ? (
        <TodoList
          data={data as any}
          scrollY={scrollY}
          header={
            <>
              <NotesToolbar
                variant="full"
                title={title}
                total={data.length}
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
                noun={plural}
                total={totalCount}
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

      {/* Selection bar for recycle actions */}
      {selectionMode && !confirmOpen && (
        <RecycleSelectionBar
          count={selectedIds.size}
          onClose={exitSelection}
          onRestore={performRestoreSelected}
          onDeleteForever={requestDeleteForever}
        />
      )}

      {/* Confirm permanent delete */}
      <ConfirmDialog
        visible={confirmOpen}
        count={selectedIds.size}
        label={selectedIds.size === 1 ? label : plural}
        actionText="will be permanently deleted"
        cancelLabel="Cancel"
        confirmLabel="Delete forever"
        onCancel={cancelDelete}
        onConfirm={performDeleteForever}
      />

      {/* Undo (restore) snackbar */}
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
    </SafeAreaView>
  );
}
