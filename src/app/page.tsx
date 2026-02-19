// src/app/page.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";

function LogoMark() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
      <span className="text-sm font-semibold tracking-[-0.02em]">SI</span>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-[-0.01em]">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  description,
}: {
  n: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

export default async function LandingPage() {
  // ✅ Signed-in users should NOT see guest landing.
  const { userId } = await auth();
  if (userId) redirect("/home");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              Smart Inventory Hub
            </p>
            <p className="text-xs text-muted-foreground">
              Asset management with an AI-assisted workflow.
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {/* Secondary (quiet) */}
          <Button asChild variant="ghost">
            <Link href="/sign-in">Sign in</Link>
          </Button>

          {/* Primary CTA */}
          <Button asChild>
            <Link href="/sign-up">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-start">
          {/* Left: hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Secure sessions • Per-user scoped data • Fast grid
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
              Manage assets with a clean, Microsoft-style workflow.
            </h1>

            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Track laptops, monitors, licenses, and more. Generate technical
              descriptions using AI, then manage everything in a powerful,
              searchable grid.
            </p>

            {/* No extra CTA block here — the header already has the actions */}

            <div className="grid gap-4 pt-2">
              <FeatureRow
                icon={<LayoutGrid className="h-4 w-4" />}
                title="Fast grid"
                description="Search, filter, and sort instantly — built for daily ops."
              />
              <FeatureRow
                icon={<Sparkles className="h-4 w-4" />}
                title="AI descriptions"
                description="Generate editable technical text in one click."
              />
              <FeatureRow
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Secure by default"
                description="Clerk sessions + per-user scoped data access."
              />
            </div>
          </div>

          {/* Right: how it works */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-2)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              How it works
            </p>

            <ol className="mt-4 space-y-3">
              <Step
                n={1}
                title="Add an asset"
                description="Type, name, serial, status, notes."
              />
              <Step
                n={2}
                title="Generate with AI"
                description="Produce a technical description you can edit."
              />
              <Step
                n={3}
                title="Manage in dashboard"
                description="Edit and organize everything in a clean grid."
              />
            </ol>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Guests can view this landing page only. Sign in to access
                    the dashboard, profile, and settings.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Smart Inventory Hub</p>
        </footer>
      </main>
    </div>
  );
}
