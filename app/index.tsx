import { useAppTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { I18nManager, Image, StyleSheet, Text, View } from "react-native";

try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {}

const TITLE = "N  o  t  e";
const TYPE_MS = 120;
const HOLD_MS = 700;

export default function Splash() {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  const [typed, setTyped] = useState("S");
  const idxRef = useRef(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const i = idxRef.current;
      if (i < TITLE.length) {
        setTyped(TITLE.slice(0, i + 1));
        idxRef.current = i + 1;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        timeoutRef.current = setTimeout(async () => {
          await SplashScreen.hideAsync();
          router.replace("/(main)/Notes");
        }, HOLD_MS);
      }
    }, TYPE_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Image
        source={require("../assets/images/splash-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: c.accent, fontFamily: theme.tokens.fonts.brand }]}>
        {typed}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 96, height: 96, marginBottom: 20 },
  title: { fontSize: 36, letterSpacing: 2 },
  subtitle: { marginTop: 8, fontSize: 14 },
});
