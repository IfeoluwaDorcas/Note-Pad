import CustomDrawerContent from "@/components/CustomDrawerContent";
import { useAppTheme } from "@/providers/ThemeProvider";
import { startDueWatcher, stopDueWatcher } from "@/src/utils/dueWatcher";
import { PortalProvider } from "@gorhom/portal";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { I18nManager, View } from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { useNotificationResponses } from "../notifications/responses";
import {
  ensureAndroidChannel,
  ensurePermissions,
} from "../notifications/setup";

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

export default function MainLayout() {
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

  return (
    <NavThemeProvider value={theme.nav}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <PortalProvider>
          <Drawer
            screenOptions={{
              headerStyle: { backgroundColor: c.card },
              headerTintColor: c.text,
              drawerStyle: { backgroundColor: c.card },
              drawerActiveTintColor: c.accent,
              drawerInactiveTintColor: c.textMuted,
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
          >
            <Drawer.Screen name="Notes" options={{ title: "Notes" }} />
            <Drawer.Screen name="Reminders" options={{ title: "Reminders" }} />
            <Drawer.Screen
              name="StickyNote"
              options={{ title: "Sticky notes" }}
            />
            <Drawer.Screen name="Todo" options={{ title: "To-do" }} />
            <Drawer.Screen name="Settings" options={{ title: "Settings" }} />
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
    </NavThemeProvider>
  );
}
