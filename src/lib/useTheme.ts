import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";
const KEY = "wc-theme";

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* yoksay */
  }
  return "system";
}

// Seçilen temayı <html data-theme="…"> olarak uygular. "system" iken
// işletim sistemi tercihini izler (değişince otomatik güncellenir).
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(read);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#171613" : "#f6f4ef");
    };
    apply();
    if (theme !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((choice: ThemeChoice) => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* yoksay */
    }
    setThemeState(choice);
  }, []);

  return { theme, setTheme };
}
