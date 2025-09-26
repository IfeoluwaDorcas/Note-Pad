import { allThemes, type AppTheme } from "@/constants/theme";
import React, { createContext, useContext, useState } from "react";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  allThemes: AppTheme[];
};

const ThemeCtx = createContext<ThemeContextValue>({
  theme: allThemes[3],
  setTheme: () => {},
  allThemes,
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [theme, setTheme] = useState<AppTheme>(allThemes[0]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, allThemes }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeCtx);
