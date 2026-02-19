// src/app/home/page.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LayoutGrid,
  User,
  Settings,
  ArrowRight,
  MoreHorizontal,
  LogOut,
} from "lucide-react";

function Tile({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "group rounded-2xl border border-border bg-card p-5",
        "shadow-[var(--shadow-1)]",
        "transition-colors hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
            {icon}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold tracking-[-0.01em]">
              {title}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

export default async function SignedInHomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const name = user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-6 py-6">
        {/* Header: title + short description + 1–2 actions */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.02em]">
              Welcome, {name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Jump back into your work. Signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary CTA */}
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>

            {/* Secondary: account menu (Profile / Settings / Sign out) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account menu">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">
                  {name}
                </DropdownMenuLabel>
                <div className="px-2 pb-2 text-xs text-muted-foreground truncate">
                  {email}
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

        {/* Main surface */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Quick access
            </p>
            <p className="text-xs text-muted-foreground">
              Common destinations for daily work.
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Tile
              title="Dashboard"
              description="Manage assets in the grid."
              href="/dashboard"
              icon={<LayoutGrid className="h-4 w-4" />}
            />
            <Tile
              title="Profile"
              description="View your account details."
              href="/profile"
              icon={<User className="h-4 w-4" />}
            />
            <Tile
              title="Settings"
              description="Security and preferences."
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
