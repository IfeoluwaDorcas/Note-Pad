import { allThemes, type AppTheme } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  setThemeByName: (name: string) => void;
  allThemes: AppTheme[];
  hydrated: boolean; // ✅ add this
};

const STORAGE_KEY = "app.themeName";

const ThemeCtx = createContext<ThemeContextValue>({
  theme: allThemes[0],
  setTheme: () => {},
  setThemeByName: () => {},
  allThemes,
  hydrated: false, // ✅ add default
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [theme, _setTheme] = useState<AppTheme>(allThemes[0]);
  const [hydrated, setHydrated] = useState(false);

  // load saved theme
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (saved) {
          const found = allThemes.find((t) => t.name === saved);
          if (found) _setTheme(found);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, theme.name).catch(() => {});
  }, [theme.name, hydrated]);

  const setTheme = (t: AppTheme) => _setTheme(t);
  const setThemeByName = (name: string) => {
    const next = allThemes.find((t) => t.name === name);
    if (next) _setTheme(next);
  };

  const value = useMemo(
    () => ({ theme, setTheme, setThemeByName, allThemes, hydrated }),
    [theme, hydrated]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useAppTheme = () => useContext(ThemeCtx);
