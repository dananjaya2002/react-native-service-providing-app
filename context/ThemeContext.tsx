import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { lightColors, darkColors, ThemeName } from "../constants/Colors";

// shape of what we provide
interface ThemeContextType {
  theme: ThemeName;
  colors: typeof lightColors;
  setTheme: (theme: ThemeName) => void;
}

const defaultContext: ThemeContextType = {
  theme: "light",
  colors: lightColors,
  setTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>("light");

  // memoize to avoid re-renders
  const value = useMemo(
    () => ({
      theme,
      colors: theme === "light" ? lightColors : darkColors,
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// custom hook for convenience
export const useTheme = () => useContext(ThemeContext);
