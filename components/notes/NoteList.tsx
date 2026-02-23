// NotesList.tsx
import { Note, ViewMode } from "@/src/types/note";
import { formatShortDate } from "@/src/utils/dates";
import { columnsFor } from "@/src/utils/notes";
import React from "react";
import { View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import NoteCard from "./NoteCard";

type Props = {
  data: Note[] & any[];
  view: ViewMode;
  scrollY?: SharedValue<number>;
  header?: React.ReactElement;

  onLongPressNote?: (id: string) => void;
  onPressNote?: (id: string) => void;

  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelectNote?: (id: string) => void;

  contentTopInset?: number;

  mode?: "default" | "recycle";
};

const SPACING = 12;

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
  mode = "default",
}: Props) {
  const cols = columnsFor(view);
  const isRow = view === "simpleList";

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (scrollY) scrollY.value = e.contentOffset.y;
    },
  });

  const renderItem = React.useCallback(
    ({
      item,
      index,
    }: {
      item: Note & { __daysLeft?: number };
      index: number;
    }) => {
      const selected = selectedIds?.has(item.id) ?? false;
      const dateLabel = formatShortDate(item.updatedAt || item.createdAt);
      const daysLeft = item.__daysLeft;

      const isLastInRow = (index + 1) % cols === 0;

      return (
        <View
          style={{
            flex: 1 / cols,
            marginBottom: SPACING,
            marginRight: isLastInRow ? 0 : SPACING,
          }}
        >
          <NoteCard
            layout={isRow ? "row" : "card"}
            title={item.title}
            subtitle={dateLabel}
            previewImage={item.previewImage}
            selectable={selectionMode}
            selected={selected}
            onToggleSelect={() => onToggleSelectNote?.(item.id)}
            onLongPress={() => onLongPressNote?.(item.id)}
            onPress={() => onPressNote?.(item.id)}
            mode={mode}
            daysLeft={mode === "recycle" ? daysLeft : undefined}
          />
        </View>
      );
    },
    [
      cols,
      isRow,
      onLongPressNote,
      onPressNote,
      onToggleSelectNote,
      selectedIds,
      selectionMode,
      mode,
    ],
  );

  const keyExtractor = React.useCallback((n: Note) => n.id, []);

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <Animated.FlatList
        data={data}
        key={cols}
        numColumns={cols}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: contentTopInset,
        }}
        ListHeaderComponent={header}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        initialNumToRender={12}
        windowSize={7}
        ItemSeparatorComponent={
          isRow ? () => <View style={{ height: 6 }} /> : undefined
        }
      />
    </View>
  );
}
