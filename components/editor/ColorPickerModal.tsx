// ColorPickerModal.tsx
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

const stripHexAlpha = (hex: string) => {
  const h = hex.trim();
  if (h[0] === "#" && h.length === 9) return h.slice(0, 7);
  return h;
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
    theme.tokens.colors.bg,
    "#6B728040",
    "#EF444440",
    "#F59E0B40",
    "#10B98140",
    "#3B82F640",
    "#8B5CF640",
    "#EC489940",
    "#FFFFFF40",
  ];

  const list = swatches ?? DEFAULTS;

  const isForeColor = title.toLowerCase().includes("text");

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
          {list.map((c) => {
            const pickValue = isForeColor ? stripHexAlpha(c) : c;

            return (
              <Pressable
                key={`${title}-${c}`}
                onPress={() => {
                  onPick(pickValue);
                  onClose();
                }}
                accessibilityLabel={`Pick ${pickValue}`}
                hitSlop={8}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: c, borderColor: themeColors.border },
                  ]}
                />
              </Pressable>
            );
          })}
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
