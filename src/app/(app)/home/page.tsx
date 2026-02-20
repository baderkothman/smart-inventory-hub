// src/app/(app)/home/page.tsx
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { LayoutGrid, User, Settings, ArrowRight } from "lucide-react";

function Tile({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
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
  const user = await currentUser();
  const name = user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <div className="space-y-5">
      {/* Page header: 1 primary CTA */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-[-0.02em]">
            Home
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-foreground">{name}</span>. Signed
            in as <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        {/* Primary CTA */}
        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </div>

      {/* Quick access */}
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold tracking-[-0.01em]">
            Quick access
          </p>
          <p className="text-xs text-muted-foreground">
            Shortcuts to common destinations.
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

      {/* Lightweight info row (no extra CTAs) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
          <p className="text-sm font-semibold tracking-[-0.01em]">Tip</p>
          <p className="mt-1 text-sm text-muted-foreground">
            In the dashboard, double-click a row to edit quickly.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
          <p className="text-sm font-semibold tracking-[-0.01em]">Theme</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the top bar button to switch between light and dark mode.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
          <p className="text-sm font-semibold tracking-[-0.01em]">Next</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add column visibility + saved views for “Microsoft Lists” vibes.
          </p>
        </div>
      </div>
    </div>
  );
}
