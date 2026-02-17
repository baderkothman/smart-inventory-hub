"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import AddAssetDialog from "./widgets/add-asset-dialog";
import EditAssetDialog from "./widgets/edit-asset-dialog";
import DeleteAssetDialog from "./widgets/delete-asset-dialog";

import { SignOutButton } from "@clerk/nextjs";

ModuleRegistry.registerModules([AllCommunityModule]);

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type AssetRow = {
  id: string;
  type: AssetType;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  imageUrl: string | null;
  status: AssetStatus;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
};

function formatDate(v: unknown) {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function GridLoadingOverlay() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-1)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        <span className="text-sm text-muted-foreground">Loading assets…</span>
      </div>
    </div>
  );
}

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `${res.status} ${res.statusText} from ${
        typeof input === "string" ? input : "request"
      }: ${text.slice(0, 400)}`,
    );
  }
  if (!text) throw new Error("Empty response body");

  return JSON.parse(text) as T;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return initials || "A";
}

function ImageCell(p: ICellRendererParams<AssetRow, string | null>) {
  const url = (p.value ?? "").trim();
  const name = p.data?.name ?? "Asset";
  const initials = getInitials(name);

  // If image fails to load, we show fallback initials (M365-like)
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className="flex items-center justify-center">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-semibold">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <img
        src={url}
        alt={name}
        className="h-9 w-9 rounded-lg border border-border object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ActionsCell(
  props: ICellRendererParams<AssetRow, unknown> & {
    onEdit: (row: AssetRow) => void;
    onDelete: (row: AssetRow) => void;
  },
) {
  const row = props.data;
  if (!row) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="h-8"
        onClick={() => props.onEdit(row)}
      >
        Edit
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => props.onDelete(row)}
      >
        Delete
      </Button>
    </div>
  );
}

export default function DashboardClient() {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilterText, setQuickFilterText] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AssetRow | null>(null);

  const defaultColDef = useMemo<ColDef<AssetRow>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: true,
    }),
    [],
  );

  const colDefs = useMemo<ColDef<AssetRow>[]>(() => {
    const createdFmt = (p: ValueFormatterParams<AssetRow, unknown>) =>
      formatDate(p.value);

    return [
      {
        headerName: "",
        field: "imageUrl",
        width: 72,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ImageCell,
      },
      { field: "type", width: 130 },
      { field: "name", flex: 1, minWidth: 240 },
      { field: "brand", width: 160 },
      { field: "model", width: 160 },
      { field: "serialNumber", headerName: "Serial", width: 200 },
      { field: "status", width: 140 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 210,
        valueFormatter: createdFmt,
      },
      {
        headerName: "Actions",
        width: 190,
        pinned: "right",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ActionsCell,
        cellRendererParams: {
          onEdit: (row: AssetRow) => {
            setActiveRow(row);
            setEditOpen(true);
          },
          onDelete: (row: AssetRow) => {
            setActiveRow(row);
            setDeleteOpen(true);
          },
        },
      },
    ];
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await fetchJson<AssetRow[]>("/api/assets");
      setRows(data);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function onRowClicked(e: RowClickedEvent<AssetRow>) {
    // M365-ish interaction: click a row to edit quickly (ignore clicks on actions area)
    if (!e.data) return;
    setActiveRow(e.data);
    setEditOpen(true);
  }

  function onGridReady(_e: GridReadyEvent<AssetRow>) {
    // placeholder: if later you want autosize columns, etc.
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-6 py-6">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Assets
            </h1>
            <p className="text-sm text-muted-foreground">
              Add, search, edit, and manage your inventory in one place.
            </p>
          </div>

          {/* Command bar */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="w-full sm:w-[280px]">
              <Input
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
                placeholder="Search assets…"
                className="h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={refresh} disabled={loading}>
                Refresh
              </Button>

              <AddAssetDialog
                onCreated={(created) => {
                  // created is already compatible with AssetRow shape
                  setRows((prev) => [created, ...prev]);
                }}
              />

              <SignOutButton redirectUrl="/">
                <Button variant="outline">Sign out</Button>
              </SignOutButton>
            </div>
          </div>
        </div>

        {/* Grid surface */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Inventory</div>
            <div className="text-xs text-muted-foreground">
              {loading ? "Loading…" : `${rows.length} item(s)`}
            </div>
          </div>

          <div className="p-3">
            <div
              className="ag-theme-quartz"
              style={{ height: 650, width: "100%" }}
            >
              <AgGridReact<AssetRow>
                theme="legacy"
                rowData={rows}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                quickFilterText={quickFilterText}
                loading={loading}
                loadingOverlayComponent={GridLoadingOverlay}
                pagination
                paginationPageSize={25}
                getRowId={(p) => p.data.id}
                rowHeight={52}
                suppressCellFocus
                enableCellTextSelection
                onRowClicked={onRowClicked}
                onGridReady={onGridReady}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditAssetDialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setActiveRow(null);
          }}
          asset={activeRow}
          onUpdated={(updated) => {
            setRows((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            );
          }}
        />

        <DeleteAssetDialog
          open={deleteOpen}
          onOpenChange={(o) => {
            setDeleteOpen(o);
            if (!o) setActiveRow(null);
          }}
          assetId={activeRow?.id ?? null}
          assetName={activeRow?.name ?? null}
          onDeleted={(id) => {
            setRows((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      </div>
    </div>
  );
}
