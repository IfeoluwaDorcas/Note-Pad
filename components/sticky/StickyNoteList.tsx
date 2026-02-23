import StickyCard from "@/components/sticky/StickyCard";
import type { StickyNote } from "@/src/types/sticky";
import React from "react";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

export type ViewMode = "gridS" | "gridM" | "gridL" | "simpleList";

function columnsFor(view: ViewMode) {
  switch (view) {
    case "gridS":
      return 3;
    case "gridM":
      return 2;
    case "gridL":
    case "simpleList":
      return 1;
    default:
      return 2;
  }
}

type Props = {
  data: (StickyNote & { __daysLeft?: number })[];
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

export default function StickyNoteList({
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
      item: StickyNote & { __daysLeft?: number };
      index: number;
    }) => {
      const selected = selectedIds?.has(item.id) ?? false;
      const isLastInRow = (index + 1) % cols === 0;

      return (
        <View
          style={{
            flex: 1 / cols,
            marginBottom: SPACING,
            marginRight: isLastInRow ? 0 : SPACING,
          }}
        >
          <StickyCard
            title={item.title}
            content={item.content}
            color={item.color}
            selectable={selectionMode}
            selected={selected}
            onToggleSelect={() => onToggleSelectNote?.(item.id)}
            onLongPress={() => onLongPressNote?.(item.id)}
            onPress={() => onPressNote?.(item.id)}
            mode={mode}
            daysLeft={mode === "recycle" ? item.__daysLeft : undefined}
          />
        </View>
      );
    },
    [
      cols,
      selectionMode,
      selectedIds,
      onLongPressNote,
      onPressNote,
      onToggleSelectNote,
      mode,
    ],
  );

  const keyExtractor = React.useCallback((n: StickyNote) => n.id, []);

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <Animated.FlatList
        data={data}
        key={cols}
        numColumns={cols}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: contentTopInset }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        initialNumToRender={12}
        windowSize={7}
        ItemSeparatorComponent={
          view === "simpleList"
            ? () => <View style={{ height: 4 }} />
            : undefined
        }
      />
    </View>
  );
}
