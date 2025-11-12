import {
  ensureAndroidChannel,
  ensurePermissions,
} from "@/app/notifications/setup";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { useAppTheme } from "@/providers/ThemeProvider";
import { startDueWatcher, stopDueWatcher } from "@/src/utils/dueWatcher";
import { PortalProvider } from "@gorhom/portal";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";

export default function MainLayout() {
  const { theme } = useAppTheme();
  const T = theme.tokens;

  useEffect(() => {
    (async () => {
      try {
        await ensurePermissions();
        await ensureAndroidChannel(T.colors.accent);
      } catch {}
    })();
  }, [T.colors.accent]);

  useEffect(() => {
    startDueWatcher(30_000);
    return () => stopDueWatcher();
  }, []);

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: T.colors.card },
      headerTintColor: T.colors.text,
      headerTitleStyle: { fontFamily: T.fonts.heading, fontSize: 18 },
      drawerStyle: { backgroundColor: T.colors.card },
      drawerActiveTintColor: T.colors.accent,
      drawerInactiveTintColor: T.colors.textMuted,
      drawerLabelStyle: { fontFamily: T.fonts.body, fontSize: 15 },
    }),
    [T]
  );

  return (
    <PortalProvider>
      <StatusBar
        style={theme.nav.dark ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
      <Drawer
        key={theme.name}
        screenOptions={screenOptions}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Notes" options={{ title: "Notes" }} />
        <Drawer.Screen name="Reminders" options={{ title: "Reminders" }} />
        <Drawer.Screen name="StickyNote" options={{ title: "Sticky notes" }} />
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
  );
}
