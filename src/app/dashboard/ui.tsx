"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
} from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAssetDialog from "./widgets/add-asset-dialog";
import EditAssetDialog from "./widgets/edit-asset-dialog";
import DeleteAssetDialog from "./widgets/delete-asset-dialog";
import { SignOutButton } from "@clerk/nextjs";

ModuleRegistry.registerModules([AllCommunityModule]);

type AssetRow = {
  id: string;
  type: "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: "IN_STOCK" | "ASSIGNED" | "RETIRED";
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
};

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
      `${res.status} ${res.statusText} from ${typeof input === "string" ? input : "request"}: ${text.slice(0, 400)}`,
    );
  }
  if (!text) throw new Error("Empty response body");
  return JSON.parse(text) as T;
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

  const colDefs = useMemo<ColDef<AssetRow>[]>(() => {
    return [
      { field: "type", filter: true, sortable: true, width: 130 },
      { field: "name", filter: true, sortable: true, flex: 1, minWidth: 220 },
      { field: "brand", filter: true, sortable: true, width: 160 },
      { field: "model", filter: true, sortable: true, width: 160 },
      { field: "serialNumber", headerName: "Serial", filter: true, width: 200 },
      { field: "status", filter: true, width: 140 },
      { field: "createdAt", headerName: "Created", width: 190 },
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

  return (
    <div className="min-h-[calc(100vh-0px)] bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-4">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Assets
            </h1>
            <p className="text-sm text-muted-foreground">
              Add, search, edit, and manage your inventory in one place.
            </p>
          </div>

          {/* Command bar (M365 style) */}
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
                onCreated={(created) =>
                  setRows((prev) => [created as AssetRow, ...prev])
                }
              />

              {/* Sign out */}
              <SignOutButton redirectUrl="/">
                <Button variant="outline">Sign out</Button>
              </SignOutButton>
            </div>
          </div>
        </div>

        {/* Grid surface */}
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
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
                quickFilterText={quickFilterText}
                loading={loading}
                loadingOverlayComponent={GridLoadingOverlay}
                pagination
                paginationPageSize={25}
                getRowId={(p) => p.data.id}
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
