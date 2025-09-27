import { useAppTheme } from "@/providers/ThemeProvider";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import { View } from "react-native";
import {
    Edge,
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  edges?: Edge[];
};

export default function Screen({ children, edges = ["top", "bottom"] }: Props) {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: c.bg,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: c.bg,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {children}
      </SafeAreaView>

      <StatusBar
        style={theme.nav.dark ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
    </View>
  );
}
