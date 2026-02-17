// src/app/profile/page.tsx
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="text-sm font-medium text-foreground/90">{label}</div>
      <div className="text-sm text-muted-foreground text-right break-all max-w-[70%]">
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
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Your account details and identity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>

            <SignOutButton redirectUrl="/">
              <Button variant="outline">Sign out</Button>
            </SignOutButton>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
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
              <p className="text-lg font-semibold tracking-[-0.02em] truncate">
                {fullName}
              </p>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <div className="px-5 py-2">
            <InfoRow label="User ID" value={userId} />
            <InfoRow label="Username" value={username} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Member since" value={createdAt} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Account security
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage sign-in methods and sessions from Settings.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/settings">Open settings</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Inventory access
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your assets are scoped to your session — other users can’t view
              them.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Next improvement
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add profile preferences (theme, default page, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
