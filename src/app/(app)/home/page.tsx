// src/app/(app)/home/page.tsx

import type React from "react";

import { currentUser } from "@clerk/nextjs/server";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Package,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { db } from "@/db";
import { assets, inventories } from "@/db/schema";
import { InventoryPieChart, type InventoryStat } from "./analytics-charts";

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
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors group-hover:text-primary"
          style={{ fontSize: "15px" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────── */

const STAT_PALETTES = {
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
} as const;

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
      className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card"
      style={{ background: p.bg }}
    >
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
              style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
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

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function SignedInHomePage() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "—";
  const userId = user?.id;

  let inventoryStats: InventoryStat[] = [];
  let totalItems = 0;
  let inStockCount = 0;
  let analyticsError: string | null = null;

  if (userId) {
    try {
      // 1) Fetch inventories (no aggregates)
      const invRows = await db
        .select({
          id: inventories.id,
          name: inventories.name,
          isDefault: inventories.isDefault,
          createdAt: inventories.createdAt,
        })
        .from(inventories)
        .where(eq(inventories.userId, userId))
        .orderBy(desc(inventories.isDefault), asc(inventories.createdAt));

      const invIds = invRows.map((r) => r.id);

      // 2) Count assets per inventory (group by assets.inventoryId)
      const countsByInv = new Map<string, number>();
      if (invIds.length > 0) {
        const countRows = await db
          .select({
            inventoryId: assets.inventoryId,
            assetCount: count(assets.id),
          })
          .from(assets)
          .where(
            and(
              eq(assets.createdByUserId, userId),
              inArray(assets.inventoryId, invIds),
            ),
          )
          .groupBy(assets.inventoryId);

        for (const r of countRows) {
          countsByInv.set(String(r.inventoryId), Number(r.assetCount ?? 0));
        }
      }

      inventoryStats = invRows.map((r) => ({
        id: r.id,
        name: r.name,
        isDefault: r.isDefault,
        assetCount: countsByInv.get(String(r.id)) ?? 0,
      }));

      totalItems = inventoryStats.reduce((s, r) => s + r.assetCount, 0);

      // 3) In-stock count (across user assets)
      const [row] = await db
        .select({ cnt: count() })
        .from(assets)
        .where(
          and(
            eq(assets.createdByUserId, userId),
            eq(assets.status, "IN_STOCK"),
          ),
        );

      inStockCount = Number(row?.cnt ?? 0);
    } catch (err: unknown) {
      console.error("HOME_ANALYTICS_QUERY_FAILED", err);
      analyticsError =
        err instanceof Error ? err.message : "Unknown database error";
    }
  }

  const hasData = inventoryStats.length > 0;

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
            in as <span className="font-medium text-foreground">{email}</span>.
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
          title="Inventories"
          value={String(inventoryStats.length)}
          icon={<Layers style={{ width: "16px", height: "16px" }} />}
          palette="violet"
        />
        <StatCard
          title="Total items"
          value={String(totalItems)}
          icon={<Package style={{ width: "16px", height: "16px" }} />}
          palette="emerald"
        />
        <StatCard
          title="In stock"
          value={String(inStockCount)}
          icon={<CheckCircle2 style={{ width: "16px", height: "16px" }} />}
          palette="amber"
        />
      </div>

      {/* ── Error card (if DB fails) ─────────────────────────────────── */}
      {analyticsError ? (
        <div className="rounded-xl border border-border bg-card px-6 py-6 shadow-card">
          <p className="text-sm font-medium">Analytics unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your server logs for{" "}
            <span className="font-mono">HOME_ANALYTICS_QUERY_FAILED</span>.
          </p>
          <p className="mt-2 break-words font-mono text-xs text-muted-foreground">
            {analyticsError}
          </p>
        </div>
      ) : hasData ? (
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <p
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
            >
              Items per inventory
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Distribution across your{" "}
              {inventoryStats.length === 1
                ? "1 inventory"
                : `${inventoryStats.length} inventories`}
              .
            </p>
          </div>

          <div className="p-5">
            <InventoryPieChart data={inventoryStats} />
          </div>

          <div className="border-t border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Inventory
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryStats.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">
                      {inv.name}
                      {inv.isDefault && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          default
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {inv.assetCount}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {totalItems === 0
                        ? "—"
                        : `${Math.round((inv.assetCount / totalItems) * 100)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            No data yet. Create your first inventory on the{" "}
            <Link
              href="/dashboard"
              className="underline underline-offset-2 hover:text-foreground"
            >
              dashboard
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
