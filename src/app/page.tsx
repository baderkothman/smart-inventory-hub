// src/app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
} from "lucide-react";

function LogoMark() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
      <span className="text-sm font-semibold tracking-[-0.02em]">SI</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-1)]">
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
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{description}</p>
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
          <Button asChild variant="ghost">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </nav>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-center">
          {/* Left: hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Secure sessions • Per-user scoped data • Fast grid
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
              Manage assets like a modern Microsoft list — fast, clean, secure.
            </h1>

            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Track laptops, monitors, licenses, and more. Generate technical
              descriptions using AI, then manage everything in a powerful,
              searchable grid.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Create account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>

              {/* ✅ Guest “Go to dashboard” flow:
                  takes them to Sign-in and returns them to /dashboard after auth */}
              <Button asChild size="lg" variant="secondary">
                <Link href="/sign-in?redirect_url=/dashboard" prefetch={false}>
                  Go to dashboard
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <FeatureCard
                icon={<LayoutGrid className="h-4 w-4" />}
                title="Fast grid"
                description="Search, filter, sort instantly — built for scale."
              />
              <FeatureCard
                icon={<Sparkles className="h-4 w-4" />}
                title="AI descriptions"
                description="Generate editable technical text in one click."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Secure"
                description="Clerk sessions + per-user access scope."
              />
            </div>
          </div>

          {/* Right: how it works */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-2)]">
            <p className="text-sm font-semibold tracking-[-0.01em]">
              How it works
            </p>

            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
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
                description="Edit, delete, and organize in a clean grid."
              />
            </ol>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Guest access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Guests can view this landing page only. Sign in to access
                    the dashboard, profile, and settings.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/sign-up">Get started</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Built for retrieval
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find assets quickly with a “Microsoft-like” grid experience.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Scoped per user
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your inventory is private to your Clerk session.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Tip: If you click “Go to dashboard” as a guest, you’ll be asked to
              sign in first, then returned to the dashboard.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Smart Inventory Hub</p>
            <div className="flex items-center gap-4">
              <Link
                className="hover:underline underline-offset-4"
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="hover:underline underline-offset-4"
                href="/sign-up"
              >
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
