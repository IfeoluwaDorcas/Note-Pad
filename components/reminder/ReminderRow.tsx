import { useAppTheme } from "@/providers/ThemeProvider";
import { formatShortDateTime, formatTimeHHmm } from "@/src/utils/dates";
import { CheckCircle2, Circle } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  remindAtISO: string;
  completed?: boolean;
  completedAtISO?: string;

  // NEW: overdue flag (from store)
  due?: boolean;

  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onToggleDone?: () => void;
  onLongPress?: () => void;
  onPress?: () => void;

  mode?: "default" | "recycle";
  daysLeft?: number;
};

export default function ReminderRow({
  title,
  remindAtISO,
  completed = false,
  completedAtISO,
  due = false,
  selectable = false,
  selected = false,
  onToggleSelect,
  onToggleDone,
  onLongPress,
  onPress,
  mode = "default",
  daysLeft,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;
  const isRecycle = mode === "recycle";

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={selectable ? onToggleSelect : onPress}
      style={({ pressed }) => [
        s.wrap,
        {
          backgroundColor: T.colors.bg,
          borderRadius: T.radius,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <Pressable
        onPress={isRecycle ? undefined : onToggleDone}
        hitSlop={10}
        style={[s.knob, isRecycle && { opacity: 0.5 }]}
      >
        {completed ? (
          <CheckCircle2 size={22} color={T.colors.accent} />
        ) : (
          <Circle size={22} color={T.colors.text} />
        )}
      </Pressable>

      <View style={s.body}>
        <Text
          numberOfLines={2}
          style={[
            s.title,
            {
              color: T.colors.text,
              textDecorationLine: completed ? "line-through" : "none",
              opacity: completed ? 0.6 : 1,
            },
          ]}
        >
          {title}
        </Text>

        <View style={s.metaRow}>
          <Text style={[s.meta, { color: T.colors.textMuted }]}>
            {formatShortDateTime(remindAtISO)}
            {completedAtISO
              ? `  •  Completed: ${formatTimeHHmm(completedAtISO)}`
              : ""}
          </Text>

          {!completed && due ? (
            <Text style={[s.meta, { color: T.colors.textMuted }]}>• Due</Text>
          ) : null}
        </View>

        {isRecycle && typeof daysLeft === "number" && (
          <Text style={[s.daysLeft, { color: T.colors.textMuted }]}>
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left
          </Text>
        )}
      </View>

      {selectable ? (
        <Pressable onPress={onToggleSelect} hitSlop={8} style={s.selectKnob}>
          {selected ? (
            <CheckCircle2 size={18} color={T.colors.text} />
          ) : (
            <Circle size={18} color={T.colors.text} />
          )}
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 15,
    paddingRight: 18,
    paddingVertical: 15,
  },
  knob: { paddingRight: 10, justifyContent: "center" },
  selectKnob: { paddingLeft: 10, paddingTop: 2 },
  body: { flex: 1, justifyContent: "flex-start" },
  title: { fontSize: 16, fontWeight: "500", includeFontPadding: false },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  meta: { fontSize: 12 },
  daysLeft: { fontSize: 12, marginTop: 6 },
});
