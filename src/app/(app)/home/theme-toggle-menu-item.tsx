"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode | null {
  try {
    const v = localStorage.getItem("theme");
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): ThemeMode {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggleMenuItem() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = readStoredTheme() ?? getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  const Icon = isDark ? Sun : Moon;

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault(); // keep behavior consistent
        setTheme((prev) => {
          const next: ThemeMode = prev === "dark" ? "light" : "dark";
          applyTheme(next);
          try {
            localStorage.setItem("theme", next);
          } catch {
            // ignore
          }
          return next;
        });
      }}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
}
