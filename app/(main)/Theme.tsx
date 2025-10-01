import { useAppTheme } from "@/providers/ThemeProvider";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function ThemeScreen() {
  const { theme, setTheme, allThemes } = useAppTheme();
  const c = theme.tokens.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <FlatList
        data={allThemes}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const isActive = item.name === theme.name;
          return (
            <Pressable
              onPress={() => setTheme(item)}
              style={[
                styles.item,
                { backgroundColor: c.card },
                isActive && {
                  borderColor: item.tokens.colors.accent,
                  borderWidth: 2,
                },
              ]}
            >
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: item.tokens.colors.accent },
                ]}
              />
              <Text
                style={[styles.itemText, { color: c.text }]}
              >
                {item.name}
              </Text>
              {isActive && (
                <Text style={[styles.activeText, { color: c.accent }]}>✓</Text>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 18 },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  itemText: { flex: 1, fontSize: 16, fontWeight: "500" },
  activeText: { fontSize: 16, fontWeight: "700", marginLeft: 8 },
});
