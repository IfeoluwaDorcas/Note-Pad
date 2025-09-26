import { useAppTheme } from "@/providers/ThemeProvider";
import { Plus } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPress: () => void;
  testID?: string;
};

export default function FAB({ onPress, testID }: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.tokens.colors.card,
          opacity: pressed ? 0.85 : 1,
          bottom: 60 + (insets?.bottom ?? 0),
        },
      ]}
    >
      <Plus size={24} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 24,
    height: 56,
    width: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});
