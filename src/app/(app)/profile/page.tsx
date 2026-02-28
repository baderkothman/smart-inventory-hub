// src/app/profile/page.tsx
import Image from "next/image";
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

import { LayoutGrid, MoreHorizontal, Settings, LogOut } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="text-sm font-medium text-foreground/90">{label}</div>
      <div className="max-w-[70%] break-all text-right text-sm text-muted-foreground">
        {value}
      </div>
    </div>
  );
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

function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Primary CTA */}
        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>

        {/* Secondary: overflow menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Quick links</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard
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
  );
}

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const fullName =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "User";

  const email = user.primaryEmailAddress?.emailAddress ?? "—";
  const username = user.username ?? "—";
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  const avatar = user.imageUrl;
  const initials = initialsFromName(fullName);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-6 py-6">
        {/* Header */}
        <PageHeader
          title="Profile"
          description="Your account details and identity."
        />

        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-4 border-b border-border px-5 py-5">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-border bg-background">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Profile photo"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[-0.02em]">
                {fullName}
              </p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="px-5 py-2">
            <InfoRow label="User ID" value={userId} />
            <InfoRow label="Username" value={username} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Member since" value={createdAt} />
          </div>
        </div>

        {/* Lightweight note (avoid extra cards/CTAs) */}
        <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
          <p className="text-sm font-semibold tracking-[-0.01em]">
            Account security
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage sign-in methods and sessions in{" "}
            <Link href="/settings" className="underline underline-offset-4">
              Settings
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
