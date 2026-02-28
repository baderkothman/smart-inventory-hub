import { SignIn } from "@clerk/nextjs";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

/* ── Decorative mock data shown in the left panel ──────────────────────── */
const MOCK_ASSETS = [
  { name: 'MacBook Pro 16"', qty: 5, status: "IN_STOCK" },
  { name: "Dell UltraSharp 27\"", qty: 12, status: "ASSIGNED" },
  { name: "Adobe Creative Cloud", qty: 25, status: "IN_STOCK" },
  { name: "Herman Miller Aeron", qty: 45, status: "IN_STOCK" },
  { name: "ThinkPad X1 Carbon", qty: 3, status: "RETIRED" },
  { name: "GitHub Enterprise", qty: 100, status: "IN_STOCK" },
  { name: 'LG UltraWide 34"', qty: 8, status: "ASSIGNED" },
] as const;

const STATUS_DOT: Record<string, string> = {
  IN_STOCK: "bg-[oklch(0.696_0.178_160)]",
  ASSIGNED: "bg-[oklch(0.769_0.188_83)]",
  RETIRED: "bg-[oklch(0.55_0.18_25)]",
};

const STATUS_BADGE: Record<string, string> = {
  IN_STOCK:
    "bg-[oklch(0.696_0.178_160/0.12)] text-[oklch(0.72_0.16_160)] border border-[oklch(0.696_0.178_160/0.25)]",
  ASSIGNED:
    "bg-[oklch(0.769_0.188_83/0.12)] text-[oklch(0.76_0.18_83)] border border-[oklch(0.769_0.188_83/0.25)]",
  RETIRED:
    "bg-[oklch(0.55_0.18_25/0.12)] text-[oklch(0.6_0.2_25)] border border-[oklch(0.55_0.18_25/0.25)]",
};

const STATUS_LABEL: Record<string, string> = {
  IN_STOCK: "stock",
  ASSIGNED: "out",
  RETIRED: "eol",
};

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function SignInPage() {
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

        {/* Violet radial glow — top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 55% at 15% 10%, oklch(0.538 0.228 290 / 0.13), transparent)",
          }}
        />

        {/* Emerald radial glow — bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 50% 40% at 85% 90%, oklch(0.696 0.178 160 / 0.07), transparent)",
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

        {/* ── Hero copy + mock dashboard ─────────────────────────────── */}
        <div className="relative z-10 space-y-8 px-10">
          <div className="space-y-3">
            <h1
              className="text-[2.6rem] font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
            >
              Every asset.
              <br />
              <span className="text-muted-foreground">One place.</span>
            </h1>
            <p className="max-w-[300px] text-sm leading-[1.8] text-muted-foreground">
              Hardware, licenses, and supplies — organized across inventories
              with real-time analytics and AI assistance.
            </p>
          </div>

          {/* Mock inventory panel */}
          <div
            className="overflow-hidden rounded-xl border border-border/40"
            style={{ background: "oklch(0.06 0.01 270 / 0.75)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-border/35 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[oklch(0.6_0.22_25/0.7)]" />
                <div className="h-2 w-2 rounded-full bg-[oklch(0.769_0.188_83/0.7)]" />
                <div className="h-2 w-2 rounded-full bg-[oklch(0.696_0.178_160/0.7)]" />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/50">
                IT Equipment · 27 assets
              </span>
              <div className="w-12" />
            </div>

            {/* Column header */}
            <div className="grid grid-cols-[1rem_1fr_auto_auto] items-center gap-x-3 border-b border-border/25 px-4 py-1.5">
              <span className="font-mono text-[9px] text-muted-foreground/35">#</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/35">
                Name
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/35">
                Qty
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/35">
                Status
              </span>
            </div>

            {/* Asset rows */}
            <div className="divide-y divide-border/20">
              {MOCK_ASSETS.map((asset, i) => (
                <div
                  key={asset.name}
                  className="grid grid-cols-[1rem_1fr_auto_auto] items-center gap-x-3 px-4 py-2.5"
                  style={{ opacity: Math.max(0.3, 1 - i * 0.09) }}
                >
                  <span className="font-mono text-[9px] text-muted-foreground/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[11px] text-foreground/75">
                    {asset.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    ×{asset.qty}
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide ${STATUS_BADGE[asset.status]}`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${STATUS_DOT[asset.status]}`}
                    />
                    {STATUS_LABEL[asset.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="relative z-10 px-10 pb-10">
          <p className="text-[11px] text-muted-foreground/35">
            © {new Date().getFullYear()} Smart Inventory Hub
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
                Sign in
              </p>
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to continue.
              </p>
            </div>

            {/* Clerk widget */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-float">
              <SignIn
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
                No account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Create one
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
