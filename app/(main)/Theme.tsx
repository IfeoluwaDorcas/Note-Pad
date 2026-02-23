import { useAppTheme } from "@/providers/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import NotesToolbar from "@/components/notes/NotesToolbar";
import Screen from "@/components/Screen";

export default function ThemeScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const { theme, setTheme, allThemes } = useAppTheme();
  const c = theme.tokens.colors;
  const HEADER_TOP_OFFSET = 50;

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <View style={{ paddingTop: HEADER_TOP_OFFSET }}>
          <NotesToolbar
            variant="full"
            title="Theme"
            noun="theme"
            total={allThemes.length}
            showSearch={false}
            showMenu={false}
            showFilters={false}
          />
        </View>
        <FlatList
          data={allThemes}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingVertical: 12 }}
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
                <Text style={[styles.itemText, { color: c.text }]}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
