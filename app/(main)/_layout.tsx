import CustomDrawerContent from "@/components/CustomDrawerContent";
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from "@/providers/ThemeProvider";
import { startDueWatcher, stopDueWatcher } from "@/src/utils/dueWatcher";
import { PortalProvider } from "@gorhom/portal";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { I18nManager, View } from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNotificationResponses } from "../notifications/responses";
import {
  ensureAndroidChannel,
  ensurePermissions,
} from "../notifications/setup";

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <MainLayout />
    </AppThemeProvider>
  );
}

function MainLayout() {
  const { theme } = useAppTheme();
  const c = theme.tokens.colors;

  useEffect(() => {
    (async () => {
      try {
        await ensurePermissions();
        await ensureAndroidChannel(c.accent);
      } catch {
        console.log("Permission denied");
      }
    })();
  }, [c.accent]);

  useEffect(() => {
    startDueWatcher(30_000);
    return () => stopDueWatcher();
  }, []);

  useNotificationResponses();

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: c.card },
      headerTintColor: c.text,
      drawerStyle: { backgroundColor: c.card },
      drawerActiveTintColor: c.accent,
      drawerInactiveTintColor: c.textMuted,
    }),
    [c.card, c.text, c.accent, c.textMuted]
  );

  return (
    <NavThemeProvider value={theme.nav}>
      <SafeAreaProvider>
        <StatusBar
          style={theme.nav.dark ? "light" : "dark"}
          translucent
          backgroundColor="transparent"
        />
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <PortalProvider>
            <Drawer
              key={theme.name}
              screenOptions={screenOptions}
              drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
              <Drawer.Screen name="Notes" options={{ title: "Notes" }} />
              <Drawer.Screen
                name="Reminders"
                options={{ title: "Reminders" }}
              />
              <Drawer.Screen
                name="StickyNote"
                options={{ title: "Sticky notes" }}
              />
              <Drawer.Screen name="Todo" options={{ title: "To-do" }} />
              <Drawer.Screen name="Theme" options={{ title: "Theme" }} />
              <Drawer.Screen
                name="DeletedNotes"
                options={{ title: "Deleted Notes" }}
              />
              <Drawer.Screen
                name="DeletedReminders"
                options={{ title: "Deleted Reminders" }}
              />
              <Drawer.Screen
                name="DeletedStickyNotes"
                options={{ title: "Deleted Sticky Notes" }}
              />
              <Drawer.Screen
                name="DeletedTodos"
                options={{ title: "Deleted To-dos" }}
              />
              <Drawer.Screen
                name="Editor"
                options={{
                  title: "Editor",
                  drawerItemStyle: { display: "none" },
                  headerShown: false,
                }}
              />
            </Drawer>
          </PortalProvider>
        </View>
      </SafeAreaProvider>
    </NavThemeProvider>
  );
}
