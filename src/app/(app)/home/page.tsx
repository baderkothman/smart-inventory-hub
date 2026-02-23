// src/app/(app)/home/page.tsx
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  User,
  Settings,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

function QuickLink({
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
        "group flex items-start justify-between gap-4 rounded-xl",
        "px-3 py-3",
        "transition-colors hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-1 grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-foreground">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.02em]">
            {value}
          </p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Hint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[-0.01em]">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default async function SignedInHomePage() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <div className="space-y-5">
      {/* Hero header (clean M365-style: title + description + 1 CTA) */}
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

      {/* Top row: quick “at-a-glance” (no extra CTAs) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Workspace"
          value="Personal"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="AI helper"
          value="Ready"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          title="Status"
          value="Active"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Main surface: quick access as a clean list (more “Microsoft 365” than tiles) */}
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold tracking-[-0.01em]">
            Quick access
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Go to your main destinations.
          </p>
        </div>

        <div className="p-3">
          <div className="grid gap-1">
            <QuickLink
              title="Dashboard"
              description="Manage assets in the grid."
              href="/dashboard"
              icon={<LayoutGrid className="h-4 w-4" />}
            />
            <QuickLink
              title="Profile"
              description="View your account details."
              href="/profile"
              icon={<User className="h-4 w-4" />}
            />
            <QuickLink
              title="Settings"
              description="Security and preferences."
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Bottom row: helpful hints (short, calm) */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Hint
          icon={<LayoutGrid className="h-4 w-4" />}
          title="Tip"
          description="In the dashboard, double-click a row to edit quickly."
        />
        <Hint
          icon={<Sparkles className="h-4 w-4" />}
          title="AI workflow"
          description="Generate a description, then edit it before saving."
        />
        <Hint
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Privacy"
          description="Assets are scoped by createdByUserId; other users can’t access your inventory."
        />
      </div>
    </div>
  );
}
