import { useAppTheme } from "@/providers/ThemeProvider";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (hex: string | null) => void;
  title?: string;
  swatches?: string[];
  themeColors: { card: string; text: string; border: string };
};

export default function ColorPickerModal({
  visible,
  onClose,
  onPick,
  title = "Choose color",
  swatches,
  themeColors,
}: Props) {
  const { theme } = useAppTheme();

  const DEFAULTS = [
    theme.tokens.colors.text,
    "#000000",
    "#1F2937",
    "#374151",
    "#6B7280",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F9FAFB",
    "#FFFFFF",
  ];

  swatches = DEFAULTS;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        <ScrollView contentContainerStyle={styles.grid} horizontal>
          {swatches.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                onPick(c);
                onClose();
              }}
              accessibilityLabel={`Pick ${c}`}
              hitSlop={8}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: c, borderColor: themeColors.border },
                ]}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000055" },
  sheet: {
    position: "absolute",
    bottom: 24,
    left: 12,
    right: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  title: { fontWeight: "600", marginBottom: 8 },
  grid: { paddingVertical: 8, gap: 12, alignItems: "center" },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1 },
});
