import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

/* ── Decorative features list shown in the left panel ───────────────────── */
const FEATURES = [
  {
    label: "Multi-inventory",
    detail: "Organize assets across unlimited inventories per account.",
  },
  {
    label: "AI descriptions",
    detail: "Generate rich asset descriptions automatically with one click.",
  },
  {
    label: "Live analytics",
    detail: "Charts and totals update instantly as your inventory changes.",
  },
  {
    label: "Quantity tracking",
    detail: "Track units, not just items — with stock and assignment states.",
  },
] as const;

const STAT_CARDS = [
  { value: "27", label: "assets tracked" },
  { value: "3", label: "inventories" },
  { value: "94%", label: "in stock" },
] as const;

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[540px_1fr]">

      {/* ──────────────────────────────────────────────────────────────────
          Left decorative panel — desktop only
      ────────────────────────────────────────────────────────────────── */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden border-r border-border/50 lg:flex"
        style={{
          background:
            "linear-gradient(155deg, oklch(0.14 0.02 270) 0%, oklch(0.08 0.013 270) 55%, oklch(0.05 0.01 270) 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              "linear-gradient(oklch(1 0 0 / 0.032) 1px, transparent 1px)",
              "linear-gradient(90deg, oklch(1 0 0 / 0.032) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "44px 44px",
          }}
        />

        {/* Amber radial glow — top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 50% at 85% 5%, oklch(0.769 0.188 83 / 0.10), transparent)",
          }}
        />

        {/* Violet radial glow — bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 45% at 10% 95%, oklch(0.538 0.228 290 / 0.11), transparent)",
          }}
        />

        {/* ── Brand ──────────────────────────────────────────────────── */}
        <div className="relative z-10 px-10 pt-10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg border border-primary/25 bg-primary/10">
              <Package className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-foreground/85">
              Smart Inventory Hub
            </span>
          </div>
        </div>

        {/* ── Hero copy + features ────────────────────────────────────── */}
        <div className="relative z-10 space-y-8 px-10">
          <div className="space-y-3">
            <h1
              className="text-[2.6rem] font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
            >
              Your inventory.
              <br />
              <span className="text-muted-foreground">Under control.</span>
            </h1>
            <p className="max-w-[300px] text-sm leading-[1.8] text-muted-foreground">
              Set up your workspace in seconds. Everything is private and scoped
              to your account.
            </p>
          </div>

          {/* Mini stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {STAT_CARDS.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border/35 px-3 py-2.5"
                style={{ background: "oklch(0.06 0.01 270 / 0.6)" }}
              >
                <p
                  className="text-xl font-bold tracking-tight text-foreground/90"
                  style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border/40 bg-border/10">
                  <span className="font-mono text-[9px] text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground/80">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-[1.6] text-muted-foreground/60">
                    {f.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="relative z-10 px-10 pb-10">
          <p className="text-[11px] text-muted-foreground/35">
            © {new Date().getFullYear()} Smart Inventory Hub. Free to start.
          </p>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          Right auth panel
      ────────────────────────────────────────────────────────────────── */}
      <main className="flex flex-col">
        {/* Mobile-only header strip */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="grid h-5 w-5 place-items-center rounded-md border border-primary/20 bg-primary/10">
              <Package className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Smart Inventory Hub</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
        </header>

        {/* Centered widget */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px] space-y-6">

            {/* Heading */}
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Create account
              </p>
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
              >
                Get started free
              </h2>
              <p className="text-sm text-muted-foreground">
                Your workspace is private — assets are scoped to your account.
              </p>
            </div>

            {/* Clerk widget */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-2)]">
              <SignUp
                appearance={{
                  elements: {
                    card: "bg-transparent shadow-none border-0",
                    cardBox: "shadow-none",
                    rootBox: "w-full",
                  },
                }}
              />
            </div>

            {/* Footer links */}
            <div className="space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Sign in
                </Link>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to landing
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
