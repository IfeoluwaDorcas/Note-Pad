import React from 'react';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

import SectionHeader from '@/components/todo/SectionHeader';
import TodoRow from '@/components/todo/TodoRow';
import type { Todo } from '@/src/state/todoStore';
import type { SharedValue } from 'react-native-reanimated';

export type TodoListViewItem = Todo & { __daysLeft?: number };

type Props = {
  data: TodoListViewItem[];
  scrollY?: SharedValue<number>;
  header?: React.ReactElement;

  onLongPressItem?: (id: string) => void;
  onPressItem?: (id: string) => void;

  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelectItem?: (id: string) => void;
  onToggleDone?: (id: string) => void;

  contentTopInset?: number;
  mode?: 'default' | 'recycle';
};

type Row =
  | { kind: 'header'; key: string; title: string }
  | { kind: 'item'; key: string; todo: TodoListViewItem };

function buildSectionedRows(data: TodoListViewItem[]): Row[] {
  const todos = data.filter(d => !d.completed);
  const dones = data.filter(d => d.completed);

  const rows: Row[] = [
    { kind: 'header' as const, key: 'hdr-todo', title: `Yet to do (${todos.length})` },
    ...todos.map<Row>(t => ({ kind: 'item' as const, key: t.id, todo: t })),
    { kind: 'header' as const, key: 'hdr-done', title: `Done (${dones.length})` },
    ...dones.map<Row>(t => ({ kind: 'item' as const, key: t.id, todo: t })),
  ];

  return rows;
}

export default function TodoList({
  data,
  scrollY,
  header,
  onLongPressItem,
  onPressItem,
  selectionMode = false,
  selectedIds,
  onToggleSelectItem,
  onToggleDone,
  contentTopInset = 0,
  mode = 'default',
}: Props) {
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { if (scrollY) scrollY.value = e.contentOffset.y; },
  });

  const rows = React.useMemo(() => buildSectionedRows(data), [data]);

  const renderRow = React.useCallback(
    ({ item }: ListRenderItemInfo<Row>) => {
      if (item.kind === 'header') {
        return (
          <View style={{ paddingHorizontal: 6, marginTop: 8 }}>
            <SectionHeader title={item.title} />
          </View>
        );
      }

      const t = item.todo;
      const selected = selectedIds?.has(t.id) ?? false;

      return (
        <View style={s.rowWrap}>
          <TodoRow
            title={t.title}
            completed={t.completed}
            selectable={selectionMode}
            selected={selected}
            onToggleSelect={() => onToggleSelectItem?.(t.id)}
            onToggleDone={mode === 'recycle' ? undefined : () => onToggleDone?.(t.id)}
            onLongPress={() => onLongPressItem?.(t.id)}
            onPress={() => onPressItem?.(t.id)}
            mode={mode}
            daysLeft={t.__daysLeft}
          />
        </View>
      );
    },
    [selectionMode, selectedIds, onToggleSelectItem, onLongPressItem, onPressItem, onToggleDone, mode]
  );

  const keyExtractor = React.useCallback((r: Row) => r.key, []);

  return (
    <Animated.FlatList
      data={rows}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      renderItem={renderRow}
      contentContainerStyle={[s.list, { paddingTop: contentTopInset }]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      removeClippedSubviews
      initialNumToRender={16}
      windowSize={10}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
    />
  );
}

const s = StyleSheet.create({
  list: { padding: 12, gap: 1 },
  rowWrap: { paddingHorizontal: 6 },
});
