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

/* ── Stat card ────────────────────────────────────────────────────────── */

const STAT_PALETTES: Record<
  string,
  { bg: string; iconBg: string; iconColor: string; accent: string }
> = {
  violet: {
    bg: "linear-gradient(135deg, oklch(0.538 0.228 290 / 0.08) 0%, transparent 80%)",
    iconBg: "oklch(0.538 0.228 290 / 0.12)",
    iconColor: "oklch(0.668 0.228 290)",
    accent: "oklch(0.668 0.228 290 / 0.20)",
  },
  emerald: {
    bg: "linear-gradient(135deg, oklch(0.696 0.178 160 / 0.10) 0%, transparent 80%)",
    iconBg: "oklch(0.696 0.178 160 / 0.12)",
    iconColor: "oklch(0.696 0.178 160)",
    accent: "oklch(0.696 0.178 160 / 0.20)",
  },
  amber: {
    bg: "linear-gradient(135deg, oklch(0.769 0.188 83 / 0.09) 0%, transparent 80%)",
    iconBg: "oklch(0.769 0.188 83 / 0.12)",
    iconColor: "oklch(0.769 0.188 83)",
    accent: "oklch(0.769 0.188 83 / 0.20)",
  },
};

function StatCard({
  title,
  value,
  icon,
  palette = "violet",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  palette?: keyof typeof STAT_PALETTES;
}) {
  const p = STAT_PALETTES[palette];
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-1)]"
      style={{ background: p.bg, borderImage: "none" }}
    >
      {/* Accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: p.accent,
          borderRadius: "12px 12px 0 0",
        }}
      />

      <div className="p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p
              className="mt-2 text-2xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                color: "var(--foreground)",
              }}
            >
              {value}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "38px",
              height: "38px",
              borderRadius: "9px",
              backgroundColor: p.iconBg,
              color: p.iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Quick link ───────────────────────────────────────────────────────── */

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
      className="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-primary transition-colors"
          style={{ fontSize: "15px" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}

/* ── Hint card ────────────────────────────────────────────────────────── */

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
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-1)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function SignedInHomePage() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  return (
    <div className="space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
          >
            Home
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-foreground">{name}</span>. Signed
            in as{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            Open dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Workspace"
          value="Personal"
          icon={<ShieldCheck style={{ width: "16px", height: "16px" }} />}
          palette="violet"
        />
        <StatCard
          title="AI helper"
          value="Ready"
          icon={<Sparkles style={{ width: "16px", height: "16px" }} />}
          palette="emerald"
        />
        <StatCard
          title="Status"
          value="Active"
          icon={<CheckCircle2 style={{ width: "16px", height: "16px" }} />}
          palette="amber"
        />
      </div>

      {/* ── Quick access ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-1)]">
        <div className="border-b border-border px-5 py-4">
          <p
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
          >
            Quick access
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Go to your main destinations.
          </p>
        </div>

        <div className="p-2">
          <QuickLink
            title="Dashboard"
            description="Manage assets in the grid."
            href="/dashboard"
            icon={<LayoutGrid style={{ width: "14px", height: "14px" }} />}
          />
          <QuickLink
            title="Profile"
            description="View your account details."
            href="/profile"
            icon={<User style={{ width: "14px", height: "14px" }} />}
          />
          <QuickLink
            title="Settings"
            description="Security and preferences."
            href="/settings"
            icon={<Settings style={{ width: "14px", height: "14px" }} />}
          />
        </div>
      </div>

      {/* ── Tips ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Hint
          icon={<LayoutGrid style={{ width: "14px", height: "14px" }} />}
          title="Tip"
          description="In the dashboard, double-click a row to edit quickly."
        />
        <Hint
          icon={<Sparkles style={{ width: "14px", height: "14px" }} />}
          title="AI workflow"
          description="Generate a description, then edit it before saving."
        />
        <Hint
          icon={<ShieldCheck style={{ width: "14px", height: "14px" }} />}
          title="Privacy"
          description="Assets are scoped by createdByUserId — other users can't access your inventory."
        />
      </div>
    </div>
  );
}
