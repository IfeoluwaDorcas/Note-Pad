import { useAppTheme } from '@/providers/ThemeProvider';
import { useNotesStore } from '@/src/state/notesStore';
import { useReminderStore } from '@/src/state/reminderStore';
import { useStickyStore } from '@/src/state/stickyStore';
import { useTodoStore } from '@/src/state/todoStore';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  Bell,
  CheckSquare,
  Notebook,
  Settings,
  StickyNote,
  Trash2,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {

  const notes = useNotesStore(s => s.notes);
  const stickiesMap = useStickyStore(s => s.stickies);
  const todosMap = useTodoStore(s => s.todos);
  const reminderMap = useReminderStore(s => s.reminders)

  const noteItems      = useMemo(() => notes.filter(n => n.type === 'note'), [notes]);
  const stickies = useMemo(() => Object.values(stickiesMap), [stickiesMap]);
  const todos    = useMemo(() => Object.values(todosMap), [todosMap]);
  const reminderItems  = useMemo(() => notes.filter(n => n.type === 'reminder'), [notes]);

  const notesActiveCount     = useMemo(() => noteItems.filter(n => !n.deletedAt).length, [noteItems]);
  const remindersActiveCount = useMemo(() => reminderItems.filter(n => !n.deletedAt).length, [reminderItems]);
  const stickyActiveCount    = useMemo(() => stickies.filter(s => !s.deletedAt).length, [stickies]);
  const todoActiveCount      = useMemo(() => todos.filter(t => !t.deletedAt).length, [todos]);

  const deletedNotesCount     = useMemo(() => noteItems.filter(n => n.deletedAt).length, [noteItems]);
  const deletedRemindersCount = useMemo(() => reminderItems.filter(n => n.deletedAt).length, [reminderItems]);
  const deletedStickyCount    = useMemo(() => stickies.filter(s => !!s.deletedAt).length, [stickies]);
  const deletedTodosCount     = useMemo(() => todos.filter(t => !!t.deletedAt).length, [todos]);

  const deletedCount = deletedNotesCount + deletedRemindersCount + deletedStickyCount + deletedTodosCount;

  const { state, navigation } = props;
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  const currentName = state.routeNames[state.index];
  const isFocused = (routeName: string) => currentName === routeName;
  const isAnyBinScreen = [
    'DeletedNotes',
    'DeletedReminders',
    'DeletedStickyNotes',
    'DeletedTodos',
  ].includes(currentName);

  const [recycleOpen, setRecycleOpen] = useState<boolean>(isAnyBinScreen);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.scroll, { backgroundColor: c.bg, flexGrow: 1 }]}
    >
      <Row
        label="Notes"
        Icon={Notebook}
        count={notesActiveCount}
        active={isFocused('Notes')}
        colors={c}
        onPress={() => navigation.navigate('Notes')}
      />
      <Row
        label="Reminder"
        Icon={Bell}
        count={remindersActiveCount}
        active={isFocused('Reminders')}
        colors={c}
        onPress={() => navigation.navigate('Reminders')}
      />
      <Row
        label="Sticky note"
        Icon={StickyNote}
        count={stickyActiveCount}
        active={isFocused('StickyNote')}
        colors={c}
        onPress={() => navigation.navigate('StickyNote')}
      />
      <Row
        label="To-do"
        Icon={CheckSquare}
        count={todoActiveCount}
        active={isFocused('Todo')}
        colors={c}
        onPress={() => navigation.navigate('TodoList')}
      />
      <Row
        label="Settings"
        Icon={Settings}
        active={isFocused('Settings')}
        colors={c}
        onPress={() => navigation.navigate('Settings')}
      />

      <View style={[styles.divider, { borderColor: c.border }]} />

      <Row
        label="Recycle bin"
        Icon={Trash2}
        count={deletedCount}
        active={isAnyBinScreen && !recycleOpen}
        colors={c}
        onPress={() => setRecycleOpen(prev => !prev)}
      />

      {recycleOpen && (
        <>
          <Row
            label="Notes"
            Icon={Notebook}
            count={deletedNotesCount}
            active={currentName === 'DeletedNotes'}
            colors={c}
            onPress={() => navigation.navigate('DeletedNotes')}
            isSub
          />
          <Row
            label="Reminders"
            Icon={Bell}
            count={deletedRemindersCount}
            active={currentName === 'DeletedReminders'}
            colors={c}
            onPress={() => navigation.navigate('DeletedReminders')}
            isSub
          />
          <Row
            label="Sticky Notes"
            Icon={StickyNote}
            count={deletedStickyCount}
            active={currentName === 'DeletedStickyNotes'}
            colors={c}
            onPress={() => navigation.navigate('DeletedStickyNotes')}
            isSub
          />
          <Row
            label="To-dos"
            Icon={CheckSquare}
            count={deletedTodosCount}
            active={currentName === 'DeletedTodos'}
            colors={c}
            onPress={() => navigation.navigate('DeletedTodos')}
            isSub
          />
        </>
      )}
    </DrawerContentScrollView>
  );
}

type RowProps = {
  label: string;
  Icon: any;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  colors: {
    text: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
    border: string;
    placeholder: string;
    bg: string;
    card: string;
  };
  onPress?: () => void;
  isSub?: boolean;
};

function Row({ label, Icon, count, active, disabled, colors, onPress, isSub = false }: RowProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        isSub && styles.subRow,
        active && {
          backgroundColor: `${colors.card}30`,
          borderLeftWidth: 2,
          borderLeftColor: colors.accentMuted,
        },
        pressed && !disabled && { opacity: 0.8 },
      ]}
      disabled={disabled}
    >
      <View style={[styles.left, isSub && styles.subLeft]}>
        <Icon size={isSub ? 16 : 18} strokeWidth={1.6} color={active ? colors.accentMuted : colors.textMuted} />
        <Text style={[styles.label, isSub && styles.subLabel, { color: active ? colors.accent : colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {typeof count === 'number' ? (
        <Text style={[styles.count, isSub && styles.subCount, { color: active ? colors.accent : colors.textMuted }]}>{count}</Text>
      ) : (
        <Text style={[styles.count, { color: colors.textMuted }]}>–</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 60, paddingBottom: 10 },
  row: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subRow: {
    paddingLeft: 30,
    marginVertical: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subLeft: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
  },
  subLabel: {
    fontSize: 15,
  },
  count: {
    fontSize: 14,
  },
  subCount: {
    fontSize: 13,
  },
  divider: {
    marginVertical: 10,
    borderTopWidth: 1,
    marginHorizontal: 12,
  },
});
