import { Note, ViewMode } from '@/src/types/note';
import { columnsFor } from '@/src/utils/notes';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import NoteCard from './NoteCard';

function formatNoteDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

type Props = {
  data: Note[] & Array<any>;
  view: ViewMode;
  scrollY?: SharedValue<number>;
  header?: React.ReactElement;

  onLongPressNote?: (id: string) => void;
  onPressNote?: (id: string) => void;

  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelectNote?: (id: string) => void;

  contentTopInset?: number;

  mode?: 'default' | 'recycle';
};

export default function NotesList({
  data,
  view,
  scrollY,
  header,
  onLongPressNote,
  onPressNote,
  selectionMode = false,
  selectedIds,
  onToggleSelectNote,
  contentTopInset = 0,
  mode = 'default',
}: Props) {
  const cols = columnsFor(view);
  const isRow = view === 'simpleList';

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (scrollY) scrollY.value = e.contentOffset.y;
    },
  });

  const renderItem = React.useCallback(
    ({ item }: { item: Note & { __daysLeft?: number } }) => {
      const selected = selectedIds?.has(item.id) ?? false;
      const dateLabel = formatNoteDate(item.updatedAt || item.createdAt);
      const daysLeft = item.__daysLeft;

      return (
        <View style={[styles.cell, { flex: 1 / cols }]}>
          <NoteCard
            layout={isRow ? 'row' : 'card'}
            title={item.title}
            subtitle={dateLabel}
            previewImage={item.previewImage}
            selectable={selectionMode}
            selected={selected}
            onToggleSelect={() => onToggleSelectNote?.(item.id)}
            onLongPress={() => onLongPressNote?.(item.id)}
            onPress={() => onPressNote?.(item.id)}
            mode={mode}
            daysLeft={mode === 'recycle' ? daysLeft : undefined}
          />
        </View>
      );
    },
    [cols, isRow, onLongPressNote, onPressNote, onToggleSelectNote, selectedIds, selectionMode, mode]
  );

  const keyExtractor = React.useCallback((n: Note) => n.id, []);

  return (
    <Animated.FlatList
      data={data}
      key={cols}
      numColumns={cols}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.grid, { paddingTop: contentTopInset }]}
      ListHeaderComponent={header}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      removeClippedSubviews
      initialNumToRender={12}
      windowSize={7}
      ItemSeparatorComponent={isRow ? (() => <View style={{ height: 6 }} />) : undefined}
    />
  );
}

const styles = StyleSheet.create({
  grid: { padding: 12, gap: 12 },
  cell: { padding: 6 },
});
