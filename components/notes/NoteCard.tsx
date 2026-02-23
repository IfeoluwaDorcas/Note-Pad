import { useAppTheme } from "@/providers/ThemeProvider";
import { Check } from "lucide-react-native";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Layout = "card" | "row";

type Props = {
  layout: Layout;
  title: string;
  subtitle?: string;
  previewImage?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  mode?: "default" | "recycle";
  daysLeft?: number;
  style?: ViewStyle;
};

export default function NoteCard({
  layout,
  title,
  subtitle,
  previewImage,
  selectable = false,
  selected = false,
  onToggleSelect,
  onPress,
  onLongPress,
  mode = "default",
  daysLeft,
  style,
}: Props) {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  const body = (
    <View style={[layout === "card" ? styles.card : styles.row, style]}>
      {layout === "card" && (
        <View style={styles.thumbWrap}>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.thumb} />
          ) : (
            <View
              style={[styles.thumb, { backgroundColor: T.colors.border }]}
            />
          )}

          {mode === "recycle" && typeof daysLeft === "number" && (
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>
                {daysLeft} {daysLeft === 1 ? "day" : "days"}
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        style={layout === "card" ? styles.textBlockCard : styles.textBlockRow}
      >
        <Text
          numberOfLines={2}
          style={{ fontSize: 13, fontWeight: "600", color: T.colors.text }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, opacity: 0.7, color: T.colors.text }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {selectable && (
        <Pressable
          onPress={onToggleSelect}
          style={({ pressed }) => [
            styles.check,
            {
              opacity: pressed ? 0.8 : 1,
              backgroundColor: selected ? T.colors.text : T.colors.card,
            },
          ]}
          hitSlop={8}
        >
          {selected ? (
            <Check size={16} color={T.colors.bg} />
          ) : (
            <View
              style={[
                styles.checkOutline,
                {
                  borderColor: T.colors.border,
                  backgroundColor: T.colors.card,
                },
              ]}
            />
          )}
        </Pressable>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={{ borderRadius: theme.tokens.radius }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  thumbWrap: {
    width: "100%",
    aspectRatio: 1.5,
    overflow: "hidden",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  thumb: { width: "100%", height: "100%" },
  textBlockCard: { paddingVertical: 10, paddingHorizontal: 2, gap: 4 },
  textBlockRow: { flex: 1, gap: 4 },
  check: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  checkOutline: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  ribbon: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  ribbonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
