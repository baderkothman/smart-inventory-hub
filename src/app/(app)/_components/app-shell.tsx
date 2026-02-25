"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  Home,
  LayoutGrid,
  User,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function getInitialTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return "dark";
  }
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function initialsFromName(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

/* ── Nav item (dark sidebar variant) ──────────────────────────────────── */

function NavItem({
  href,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const active = useMemo(() => {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [href, pathname]);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none"
      style={{
        color: active ? "#C4B5FD" : "rgba(148,163,184,0.70)",
        backgroundColor: active ? "rgba(124,58,237,0.10)" : "transparent",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(226,232,240,0.90)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          (e.currentTarget as HTMLElement).style.color =
            "rgba(148,163,184,0.70)";
        }
      }}
    >
      {/* Active left pill */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "3px",
            height: "18px",
            backgroundColor: "#A78BFA",
            boxShadow: "0 0 8px #A78BFA",
          }}
        />
      )}

      {/* Icon */}
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          color: active ? "#A78BFA" : "rgba(100,116,139,0.90)",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <span style={{ letterSpacing: "-0.005em" }}>{label}</span>
    </Link>
  );
}

/* ── Shell ─────────────────────────────────────────────────────────────── */

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return;
      if (e.newValue !== "light" && e.newValue !== "dark") return;
      setTheme(e.newValue as ThemeMode);
      applyTheme(e.newValue as ThemeMode);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const pageTitle = useMemo(() => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/profile")) return "Profile";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Home";
  }, [pathname]);

  const accountName =
    user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "—";
  const initials = initialsFromName(accountName);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  /* Sidebar inner content (shared desktop + mobile) */
  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <NavItem
            href="/home"
            icon={<Home style={{ width: "15px", height: "15px" }} />}
            label="Home"
            onNavigate={onNavigate}
          />
          <NavItem
            href="/dashboard"
            icon={<LayoutGrid style={{ width: "15px", height: "15px" }} />}
            label="Dashboard"
            onNavigate={onNavigate}
          />
          <NavItem
            href="/profile"
            icon={<User style={{ width: "15px", height: "15px" }} />}
            label="Profile"
            onNavigate={onNavigate}
          />
          <NavItem
            href="/settings"
            icon={<Settings style={{ width: "15px", height: "15px" }} />}
            label="Settings"
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      {/* User card */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.07)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "32px",
              height: "32px",
              borderRadius: "7px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.50), rgba(167,139,250,0.50))",
              border: "1px solid rgba(124,58,237,0.35)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#C4B5FD",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(226,232,240,0.90)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {accountName}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(100,116,139,0.80)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {accountEmail}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="flex min-h-[100dvh]">

        {/* ── Desktop sidebar (always dark) ─────────────────────────── */}
        <aside
          className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-[100dvh]"
          style={{
            width: "232px",
            flexShrink: 0,
            backgroundColor: "#060810",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Logo area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              height: "56px",
              padding: "0 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "30px",
                height: "30px",
                borderRadius: "7px",
                background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                boxShadow: "0 0 14px rgba(124,58,237,0.40)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                SI
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "rgba(240,240,255,0.92)",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Smart Inventory
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(100,116,139,0.70)",
                  letterSpacing: "0.01em",
                }}
              >
                {pageTitle}
              </div>
            </div>
          </div>

          <SidebarContent />
        </aside>

        {/* ── Main content column ────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Top bar */}
          <header
            className="sticky top-0 z-40 border-b border-border backdrop-blur"
            style={{
              backgroundColor: "color-mix(in oklch, var(--background) 85%, transparent)",
            }}
          >
            <div
              className="flex w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
              style={{ height: "56px" }}
            >
              {/* Left: mobile menu + breadcrumb */}
              <div className="flex min-w-0 items-center gap-2">
                {/* Mobile nav trigger */}
                <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  {/* Mobile drawer */}
                  <DialogContent
                    className={cn(
                      "left-0 top-0 h-[100dvh] w-[min(88vw,280px)] max-w-none",
                      "translate-x-0 translate-y-0 rounded-r-2xl rounded-l-none",
                      "p-0",
                    )}
                    style={{
                      backgroundColor: "#060810",
                      border: "none",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <DialogHeader
                      className="px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <DialogTitle
                        style={{
                          fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                          color: "rgba(240,240,255,0.90)",
                          fontSize: "14px",
                        }}
                      >
                        Navigation
                      </DialogTitle>
                    </DialogHeader>

                    <div style={{ display: "flex", flexDirection: "column", height: "calc(100% - 48px)" }}>
                      <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Breadcrumb */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      letterSpacing: "-0.02em",
                      color: "var(--foreground)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {pageTitle}
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1.5">
                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>

                {/* Account dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      aria-label="Account menu"
                    >
                      {/* Mini avatar */}
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: "26px",
                          height: "26px",
                          borderRadius: "6px",
                          background: "linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 70%, white))",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {initials}
                      </div>
                      <span
                        className="hidden sm:block"
                        style={{
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--foreground)",
                        }}
                      >
                        {accountName}
                      </span>
                      <ChevronDown
                        style={{
                          width: "13px",
                          height: "13px",
                          color: "var(--muted-foreground)",
                        }}
                      />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel
                      style={{ fontSize: "13px" }}
                      className="truncate"
                    >
                      {accountName}
                    </DropdownMenuLabel>
                    <div className="px-2 pb-2 text-xs text-muted-foreground truncate">
                      {accountEmail}
                    </div>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <SignOutButton redirectUrl="/">
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </SignOutButton>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
