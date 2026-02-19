// src/app/settings/[[...rest]]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserProfile, SignOutButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LayoutGrid, MoreHorizontal, User, Home, LogOut } from "lucide-react";

export default async function SettingsCatchAllPage() {
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
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage account security, sessions, and profile preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary CTA */}
            <Button asChild>
              <Link href="/dashboard" prefetch={false}>
                Open dashboard
              </Link>
            </Button>

            {/* Secondary: overflow menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {name}
                </DropdownMenuLabel>
                <div className="px-2 pb-2 text-xs text-muted-foreground truncate">
                  {email}
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/home" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    className="flex items-center"
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    prefetch={false}
                    className="flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
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

        {/* Clerk surface */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="p-3">
            <UserProfile path="/settings" routing="path" />
          </div>
        </div>
      </div>
    </div>
  );
}
