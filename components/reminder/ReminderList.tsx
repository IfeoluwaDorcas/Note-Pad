import ReminderRow from "@/components/reminder/ReminderRow";
import SectionHeader from "@/components/todo/SectionHeader";
import type { Reminder } from "@/src/state/reminderStore";
import React from "react";
import { ListRenderItemInfo, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

export type ReminderViewItem = Reminder & { __daysLeft?: number };

type Props = {
  data: ReminderViewItem[];
  scrollY?: SharedValue<number>;
  header?: React.ReactElement;

  onLongPressItem?: (id: string) => void;
  onPressItem?: (id: string) => void;

  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelectItem?: (id: string) => void;
  onToggleDone?: (id: string) => void;

  contentTopInset?: number;
  mode?: "default" | "recycle";
};

type Row =
  | { kind: "header"; key: string; title: string }
  | { kind: "item"; key: string; reminder: ReminderViewItem };

// Only two sections: Upcoming and Completed
function buildSectionedRows(data: ReminderViewItem[]): Row[] {
  const upcoming = data.filter((d) => !d.completed); // includes overdue too; we just show a badge
  const completed = data.filter((d) => d.completed);

  const rows: Row[] = [
    {
      kind: "header",
      key: "hdr-upcoming",
      title: `Upcoming (${upcoming.length})`,
    },
    ...upcoming.map<Row>((r) => ({ kind: "item", key: r.id, reminder: r })),
    {
      kind: "header",
      key: "hdr-completed",
      title: `Completed (${completed.length})`,
    },
    ...completed.map<Row>((r) => ({ kind: "item", key: r.id, reminder: r })),
  ];

  return rows;
}

export default function ReminderList({
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
  mode = "default",
}: Props) {
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (scrollY) scrollY.value = e.contentOffset.y;
    },
  });

  const rows = React.useMemo(() => buildSectionedRows(data), [data]);

  const renderRow = React.useCallback(
    ({ item }: ListRenderItemInfo<Row>) => {
      if (item.kind === "header") {
        return (
          <View style={{ marginTop: 8 }}>
            <SectionHeader title={item.title} />
          </View>
        );
      }

      const r = item.reminder;
      const selected = selectedIds?.has(r.id) ?? false;

      return (
        <View>
          <ReminderRow
            title={r.title}
            remindAtISO={r.remindAt}
            completed={r.completed}
            completedAtISO={r.completedAt}
            due={r.due}
            selectable={selectionMode}
            selected={selected}
            onToggleSelect={() => onToggleSelectItem?.(r.id)}
            onToggleDone={
              mode === "recycle" ? undefined : () => onToggleDone?.(r.id)
            }
            onLongPress={() => onLongPressItem?.(r.id)}
            onPress={() => onPressItem?.(r.id)}
            mode={mode}
            daysLeft={mode === "recycle" ? r.__daysLeft : undefined}
          />
        </View>
      );
    },
    [
      selectionMode,
      selectedIds,
      onToggleSelectItem,
      onLongPressItem,
      onPressItem,
      onToggleDone,
      mode,
    ],
  );

  const keyExtractor = React.useCallback((r: Row) => r.key, []);

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <Animated.FlatList
        data={rows}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        renderItem={renderRow}
        contentContainerStyle={{ paddingTop: contentTopInset }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        initialNumToRender={16}
        windowSize={10}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </View>
  );
}
