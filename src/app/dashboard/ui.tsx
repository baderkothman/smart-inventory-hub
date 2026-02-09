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
    <div className="flex items-center justify-center h-full">
      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
        className="h-8 px-3"
        onClick={() => props.onEdit(row)}
      >
        Edit
      </Button>
      <Button
        variant="secondary"
        className="h-8 px-3 text-red-600 hover:text-red-700"
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
      { field: "name", filter: true, sortable: true, flex: 1, minWidth: 200 },
      { field: "brand", filter: true, sortable: true, width: 160 },
      { field: "model", filter: true, sortable: true, width: 160 },
      { field: "serialNumber", headerName: "Serial", filter: true, width: 200 },
      { field: "status", filter: true, width: 140 },
      { field: "createdAt", headerName: "Created", width: 190 },

      {
        headerName: "Actions",
        width: 170,
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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Smart Inventory Hub</h1>

        <div className="flex items-center gap-2">
          <Input
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            placeholder="Search assets..."
            className="w-[260px]"
          />

          <Button variant="secondary" onClick={refresh} disabled={loading}>
            Refresh
          </Button>

          <AddAssetDialog
            onCreated={(created) =>
              setRows((prev) => [created as AssetRow, ...prev])
            }
          />

          {/* ✅ Sign out → back to home */}
          <SignOutButton redirectUrl="/">
            <Button variant="secondary">Sign out</Button>
          </SignOutButton>
        </div>
      </div>

      <div className="ag-theme-quartz" style={{ height: 650, width: "100%" }}>
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
  );
}
