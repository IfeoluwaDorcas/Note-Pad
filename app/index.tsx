import Screen from "@/components/Screen";
import { useAppTheme } from "@/providers/ThemeProvider";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { I18nManager, StyleSheet, Text, View } from "react-native";

try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {}

const TITLE = "N  o  t  e"; // your spaced-out text
const TYPE_MS = 120;
const HOLD_MS = 700;

// ✅ pick the actual Expo Router path (group names are NOT included)
const HOME_ROUTE = "/Notes"; // if your file is app/(main)/Notes.tsx
// If your filename is notes.tsx it's likely "/notes"

export default function Splash() {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  const [typed, setTyped] = useState("");
  const idxRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // simple typewriter
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
        timeoutRef.current = setTimeout(() => {
          router.replace(HOME_ROUTE); // ✅ no (main) in the path
        }, HOLD_MS);
      }
    }, TYPE_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        <Text
          style={[
            styles.header,
            { color: c.accent, fontFamily: theme.tokens.fonts.brand },
          ]}
        >
          S c r i p t
        </Text>
        <Text
          style={[
            styles.title,
            { color: c.accent, fontFamily: theme.tokens.fonts.body },
          ]}
        >
          {typed}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { marginBottom: 16, fontSize: 36 },
  title: { fontSize: 24, letterSpacing: 2 },
});
