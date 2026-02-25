// src/app/page.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LayoutGrid, Sparkles, ShieldCheck, Lock, ArrowRight } from "lucide-react";

/* ─── Tiny primitives ─────────────────────────────────────────────────── */

function GradientLogoMark() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
        borderRadius: "10px",
        width: "36px",
        height: "36px",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        boxShadow: "0 0 20px rgba(124,58,237,0.45)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-syne), Syne, ui-sans-serif",
          fontWeight: 700,
          fontSize: "13px",
          color: "white",
          letterSpacing: "-0.02em",
        }}
      >
        SI
      </span>
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
    <div className="flex items-start gap-4">
      <div
        style={{
          marginTop: "2px",
          display: "grid",
          placeItems: "center",
          width: "36px",
          height: "36px",
          flexShrink: 0,
          borderRadius: "8px",
          border: "1px solid rgba(124,58,237,0.35)",
          backgroundColor: "rgba(124,58,237,0.10)",
          color: "#A78BFA",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(240,240,255,0.92)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </p>
        <p style={{ marginTop: "2px", fontSize: "14px", color: "rgba(148,163,184,0.80)", lineHeight: "1.5" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <li className="flex gap-4">
      <span
        style={{
          marginTop: "2px",
          display: "grid",
          placeItems: "center",
          width: "24px",
          height: "24px",
          flexShrink: 0,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #9D5CF6)",
          color: "white",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {n}
      </span>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(240,240,255,0.90)" }}>{title}</p>
        <p style={{ fontSize: "13px", color: "rgba(148,163,184,0.75)", marginTop: "2px" }}>{description}</p>
      </div>
    </li>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/home");

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#07080F", color: "#E2E8F0" }}
    >
      {/* ── Ambient background glows ─────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-center violet radial */}
        <div
          style={{
            position: "absolute",
            top: "-8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "700px",
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.20) 0%, transparent 68%)",
            filter: "blur(40px)",
          }}
        />
        {/* Bottom-right secondary glow */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-8%",
            width: "600px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.09) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(7,8,15,0.75)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-6xl items-center justify-between px-6"
          style={{ height: "60px" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <GradientLogoMark />
            <div>
              <p
                style={{
                  fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "rgba(240,240,255,0.95)",
                  letterSpacing: "-0.02em",
                }}
              >
                Smart Inventory Hub
              </p>
              <p style={{ fontSize: "11px", color: "rgba(148,163,184,0.65)" }}>
                Asset management with AI
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link
              href="/sign-in"
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(148,163,184,0.85)",
                transition: "background 0.15s, color 0.15s",
              }}
              className="hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-1.5 transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: "7px 18px",
                borderRadius: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #7C3AED 0%, #9D5CF6 100%)",
                boxShadow: "0 0 24px rgba(124,58,237,0.38)",
                transition: "opacity 0.15s, transform 0.15s",
              }}
            >
              Get started <ArrowRight style={{ width: "14px", height: "14px" }} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 relative z-10">
        <section className="grid gap-12 py-16 lg:grid-cols-2 lg:items-start">

          {/* Left: Hero */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Badge pill */}
            <div
              className="animate-fade-up inline-flex items-center gap-2 self-start"
              style={{
                border: "1px solid rgba(124,58,237,0.40)",
                backgroundColor: "rgba(124,58,237,0.10)",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#C4B5FD",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#A78BFA",
                  boxShadow: "0 0 8px #A78BFA",
                  flexShrink: 0,
                }}
              />
              Secure sessions · Per-user data · Fast grid
            </div>

            {/* Heading */}
            <h1
              className="animate-fade-up animate-fade-up-1"
              style={{
                fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                fontWeight: 800,
                fontSize: "clamp(40px, 5.5vw, 58px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "rgba(240,240,255,0.97)",
              }}
            >
              Manage assets{" "}
              <span
                style={{
                  background: "linear-gradient(130deg, #C4B5FD 20%, #7C3AED 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                smarter.
              </span>
            </h1>

            {/* Description */}
            <p
              className="animate-fade-up animate-fade-up-2"
              style={{
                maxWidth: "480px",
                fontSize: "16px",
                lineHeight: 1.75,
                color: "rgba(148,163,184,0.82)",
              }}
            >
              Track laptops, monitors, licenses, and more. Generate technical
              descriptions using AI, then manage everything in a powerful,
              searchable grid.
            </p>

            {/* Feature rows */}
            <div
              className="animate-fade-up animate-fade-up-3"
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              <FeatureRow
                icon={<LayoutGrid style={{ width: "15px", height: "15px" }} />}
                title="Fast grid"
                description="Search, filter, and sort instantly — built for daily ops."
              />
              <FeatureRow
                icon={<Sparkles style={{ width: "15px", height: "15px" }} />}
                title="AI descriptions"
                description="Generate editable technical text in one click."
              />
              <FeatureRow
                icon={<ShieldCheck style={{ width: "15px", height: "15px" }} />}
                title="Secure by default"
                description="Clerk sessions + per-user scoped data access."
              />
            </div>
          </div>

          {/* Right: How it works card */}
          <div
            className="animate-fade-up animate-fade-up-4"
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(18,20,36,0.85)",
              backdropFilter: "blur(16px)",
              padding: "28px",
              boxShadow:
                "0 20px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne), Syne, ui-sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "rgba(240,240,255,0.90)",
                letterSpacing: "-0.01em",
              }}
            >
              How it works
            </p>

            <ol
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Step n={1} title="Add an asset" description="Type, name, serial, status, notes." />
              <Step n={2} title="Generate with AI" description="Produce a technical description you can edit." />
              <Step n={3} title="Manage in dashboard" description="Edit and organize everything in a clean grid." />
            </ol>

            {/* Access info */}
            <div
              style={{
                marginTop: "24px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
                padding: "16px",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  style={{
                    marginTop: "2px",
                    display: "grid",
                    placeItems: "center",
                    width: "36px",
                    height: "36px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "rgba(148,163,184,0.65)",
                  }}
                >
                  <Lock style={{ width: "15px", height: "15px" }} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "rgba(240,240,255,0.88)",
                    }}
                  >
                    Access
                  </p>
                  <p
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "rgba(148,163,184,0.72)",
                      lineHeight: "1.55",
                    }}
                  >
                    Guests can view this landing page only. Sign in to access
                    the dashboard, profile, and settings.
                  </p>
                </div>
              </div>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "rgba(100,116,139,0.80)",
                }}
              >
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  style={{
                    color: "#A78BFA",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                  className="hover:opacity-75"
                >
                  Sign in
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "24px",
            fontSize: "12px",
            color: "rgba(71,85,105,0.80)",
          }}
        >
          <p>© {new Date().getFullYear()} Smart Inventory Hub</p>
        </footer>
      </main>
    </div>
  );
}
