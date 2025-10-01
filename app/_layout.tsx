import { useAppFonts } from "@/hooks/useAppFonts";
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from "@/providers/ThemeProvider";

import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemeGate />
    </AppThemeProvider>
  );
}

function ThemeGate() {
  const { theme, hydrated } = useAppTheme();
  const fontsReady = useAppFonts();
  const ready = hydrated && fontsReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <NavThemeProvider value={theme.nav}>
      <SafeAreaProvider>
        {ready ? <Slot /> : <View style={{ flex: 1 }} />}
      </SafeAreaProvider>
    </NavThemeProvider>
  );
}
