import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

function Tile({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group rounded-2xl border border-border bg-card p-5",
        "shadow-[var(--shadow-1)]",
        "transition-colors",
        "hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-[-0.01em]">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-foreground">
          <span className="text-base leading-none">›</span>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Welcome, {name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose where you want to go. Your inventory is scoped to your
              session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>

        {/* Main surface */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.01em]">
                Quick access
              </p>
              <p className="text-xs text-muted-foreground">
                Common destinations for daily work.
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user?.primaryEmailAddress?.emailAddress ?? "—"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Tile
              title="Dashboard"
              description="Manage assets in the grid (add, edit, delete)."
              href="/dashboard"
            />
            <Tile
              title="Profile"
              description="View your account details and identity."
              href="/profile"
            />
            <Tile
              title="Settings"
              description="Security, preferences, and account options."
              href="/settings"
            />
          </div>
        </div>

        {/* Secondary info row */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">Security</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clerk manages sessions securely; API routes require
              authentication.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Ownership
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assets are scoped per user so other users can’t view your
              inventory.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Next step
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an image field to assets for better identification in the
              grid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
