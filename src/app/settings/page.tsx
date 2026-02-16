import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage account security, sessions, and profile preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/home">Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Account & Security
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Update profile details, email/password, and active sessions.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none border-0 p-0",
                  navbar: "bg-transparent",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
