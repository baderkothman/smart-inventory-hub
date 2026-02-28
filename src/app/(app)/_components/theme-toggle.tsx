"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "sih-theme";
type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

function getStoredTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return "dark";
  }
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setTheme(getStoredTheme());

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return;
      if (e.newValue !== "light" && e.newValue !== "dark") return;
      setTheme(e.newValue as ThemeMode);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 shadow-card">
      <div>
        <p className="text-sm font-medium">Appearance</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {theme === "dark" ? "Dark mode is on" : "Light mode is on"}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <>
            <Sun className="h-3.5 w-3.5" />
            Light mode
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5" />
            Dark mode
          </>
        )}
      </button>
    </div>
  );
}
