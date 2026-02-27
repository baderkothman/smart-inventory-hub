"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

export type PreviewAsset = {
  id: string;
  inventoryId: string | null;
  type: AssetType;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  imageUrl: string | null;
  status: AssetStatus;
  quantity: number;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
};

function labelize(v: string) {
  return v
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(v: unknown) {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "A"
  );
}

const STATUS_STYLES: Record<AssetStatus, string> = {
  IN_STOCK:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  ASSIGNED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  RETIRED: "bg-slate-500/15 text-slate-500",
};

const TYPE_STYLES: Record<AssetType, string> = {
  LAPTOP: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  MONITOR: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  LICENSE: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  OTHER: "bg-slate-500/15 text-slate-500",
};

export default function AssetPreviewPanel({
  asset,
  inventoryName,
  onEdit,
  onDelete,
  onClose,
}: {
  asset: PreviewAsset;
  inventoryName: string | null;
  onEdit: (a: PreviewAsset) => void;
  onDelete: (a: PreviewAsset) => void;
  onClose: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!asset.imageUrl && !imgFailed;

  const detailPairs = [
    { label: "Qty", value: String(asset.quantity) },
    { label: "Brand", value: asset.brand },
    { label: "Model", value: asset.model },
    { label: "Serial", value: asset.serialNumber },
  ].filter((p) => p.value != null && p.value !== "");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-border px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Preview
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={() => onEdit(asset)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(asset)}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        <div className="border-b border-border">
          {hasImage ? (
            <img
              src={asset.imageUrl!}
              alt={asset.name}
              className="h-44 w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="grid h-44 place-items-center bg-secondary/30">
              <div
                className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-card font-bold text-muted-foreground/30"
                style={{
                  fontFamily: "var(--font-syne), Syne, sans-serif",
                  fontSize: 28,
                }}
              >
                {getInitials(asset.name)}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 px-4 py-4">
          {/* Name + badges */}
          <div className="space-y-2">
            <h3
              className="text-sm font-semibold leading-snug"
              style={{ fontFamily: "var(--font-syne), Syne, sans-serif" }}
            >
              {asset.name}
            </h3>
            <div className="flex flex-wrap gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLES[asset.type]}`}
              >
                {labelize(asset.type)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[asset.status]}`}
              >
                {labelize(asset.status)}
              </span>
              {inventoryName && (
                <span className="rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {inventoryName}
                </span>
              )}
              {!asset.inventoryId && (
                <span className="rounded-full bg-border/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                  Unassigned
                </span>
              )}
            </div>
          </div>

          {/* Detail grid */}
          {detailPairs.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5">
              {detailPairs.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg bg-secondary/40 px-2.5 py-1.5"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {asset.description && (
            <div className="space-y-1">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Description
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {asset.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {asset.notes && (
            <div className="space-y-1">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Notes
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {asset.notes}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-1.5 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Created
              </span>
              <span className="text-[10px] font-medium">
                {formatDate(asset.createdAt)}
              </span>
            </div>
            {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Updated
                </span>
                <span className="text-[10px] font-medium">
                  {formatDate(asset.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
