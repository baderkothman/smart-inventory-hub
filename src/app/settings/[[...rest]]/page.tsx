// src/app/settings/[[...rest]]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function SettingsCatchAllPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your account, security, and sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard" prefetch={false}>
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile" prefetch={false}>
                Profile
              </Link>
            </Button>
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
