import React, { createContext, useContext, useEffect, useState } from "react";
import logoDefault from "@/assets/logo-default.png.asset.json";
import logoCitrus from "@/assets/logo-citrus.png.asset.json";
import logoAqua from "@/assets/logo-aqua.png.asset.json";
import logoDusk from "@/assets/logo-dusk.png.asset.json";

export type ThemeId = "default" | "citrus" | "aqua" | "dusk";

export interface ThemeMeta {
  id: ThemeId;
  labelKey: string;
  swatches: [string, string];
  logoUrl: string;
}

export const THEMES: Record<ThemeId, ThemeMeta> = {
  default: {
    id: "default",
    labelKey: "settings.theme.default",
    swatches: ["#186047", "#A4B237"],
    logoUrl: logoDefault.url,
  },
  citrus: {
    id: "citrus",
    labelKey: "settings.theme.citrus",
    swatches: ["#FF7F50", "#32CD32"],
    logoUrl: logoCitrus.url,
  },
  aqua: {
    id: "aqua",
    labelKey: "settings.theme.aqua",
    swatches: ["#008080", "#87CEEB"],
    logoUrl: logoAqua.url,
  },
  dusk: {
    id: "dusk",
    labelKey: "settings.theme.dusk",
    swatches: ["#800080", "#B87333"],
    logoUrl: logoDusk.url,
  },
};

const STORAGE_KEY = "pantry_theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  logoUrl: string;
  themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isValidTheme = (val: string | null): val is ThemeId =>
  val === "default" || val === "citrus" || val === "aqua" || val === "dusk";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "default";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isValidTheme(stored) ? stored : "default";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, logoUrl: THEMES[theme].logoUrl, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const useThemeLogo = () => useTheme().logoUrl;