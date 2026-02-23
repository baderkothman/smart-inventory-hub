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
  MoreHorizontal,
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
  // If a theme class was already applied (e.g., by an early script), honor it.
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
      className={cn(
        [
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        ].join(" "),
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-md border border-border bg-background",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

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
      setTheme(e.newValue);
      applyTheme(e.newValue);
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

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="flex min-h-[100dvh]">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col md:sticky md:top-0 md:h-[100dvh]">
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <span className="text-sm font-semibold tracking-[-0.02em]">
                SI
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.01em]">
                Smart Inventory Hub
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {pageTitle}
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            <NavItem
              href="/home"
              icon={<Home className="h-4 w-4" />}
              label="Home"
            />
            <NavItem
              href="/dashboard"
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Dashboard"
            />
            <NavItem
              href="/profile"
              icon={<User className="h-4 w-4" />}
              label="Profile"
            />
            <NavItem
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
            />
          </nav>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {accountName}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {accountEmail}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-2">
                {/* Mobile nav drawer */}
                <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label="Open navigation"
                      title="Navigation"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  {/* Drawer-style dialog (override centered defaults) */}
                  <DialogContent
                    className={cn(
                      "left-0 top-0 h-[100dvh] w-[min(92vw,360px)] max-w-none",
                      "translate-x-0 translate-y-0 rounded-r-2xl rounded-l-none",
                      "p-0",
                    )}
                  >
                    <DialogHeader className="border-b border-border p-4">
                      <DialogTitle>Navigation</DialogTitle>
                    </DialogHeader>

                    <div className="p-2">
                      <NavItem
                        href="/home"
                        icon={<Home className="h-4 w-4" />}
                        label="Home"
                        onNavigate={() => setMobileNavOpen(false)}
                      />
                      <NavItem
                        href="/dashboard"
                        icon={<LayoutGrid className="h-4 w-4" />}
                        label="Dashboard"
                        onNavigate={() => setMobileNavOpen(false)}
                      />
                      <NavItem
                        href="/profile"
                        icon={<User className="h-4 w-4" />}
                        label="Profile"
                        onNavigate={() => setMobileNavOpen(false)}
                      />
                      <NavItem
                        href="/settings"
                        icon={<Settings className="h-4 w-4" />}
                        label="Settings"
                        onNavigate={() => setMobileNavOpen(false)}
                      />
                    </div>

                    <div className="mt-auto border-t border-border p-3">
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {accountName}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {accountEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-[-0.01em]">
                    {pageTitle}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    Smart Inventory Hub
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Home shortcut (requested) */}
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Go to Home"
                  title="Home"
                >
                  <Link href="/home">
                    <Home className="h-4 w-4" />
                  </Link>
                </Button>

                {/* Theme toggle (requested) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
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

                {/* Account menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      aria-label="Account menu"
                      title="Account"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate">
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

          {/* Content (scroll container) */}
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
