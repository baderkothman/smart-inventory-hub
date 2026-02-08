"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ModuleRegistry } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAssetDialog from "./widgets/add-asset-dialog";

ModuleRegistry.registerModules([AllCommunityModule]);

type AssetRow = {
  id: string;
  type: string;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
  description: string | null;
  createdAt: string;
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

  if (!text) {
    throw new Error(
      `Empty response body from ${typeof input === "string" ? input : "request"}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Non-JSON response from ${typeof input === "string" ? input : "request"}: ${text.slice(0, 400)}`,
    );
  }
}

export default function DashboardClient() {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilterText, setQuickFilterText] = useState("");

  const colDefs = useMemo<ColDef<AssetRow>[]>(
    () => [
      { field: "type", filter: true, sortable: true, width: 130 },
      { field: "name", filter: true, sortable: true, flex: 1 },
      { field: "brand", filter: true, sortable: true, width: 160 },
      { field: "model", filter: true, sortable: true, width: 160 },
      { field: "serialNumber", headerName: "Serial", filter: true, width: 200 },
      { field: "status", filter: true, width: 140 },
      { field: "createdAt", headerName: "Created", width: 190 },
    ],
    [],
  );

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
            onCreated={(created) => setRows((prev) => [created, ...prev])}
          />
        </div>
      </div>

      <div className="ag-theme-quartz" style={{ height: 650, width: "100%" }}>
        <AgGridReact<AssetRow>
          /* ✅ Fix AG Grid #239: keep CSS theme, opt into legacy theme mode */
          theme="legacy" /* :contentReference[oaicite:2]{index=2} */
          rowData={rows}
          columnDefs={colDefs}
          quickFilterText={
            quickFilterText
          } /* :contentReference[oaicite:3]{index=3} */
          /* Loading overlay control (supported; legacy overlay API) :contentReference[oaicite:4]{index=4} */
          loading={loading}
          loadingOverlayComponent={GridLoadingOverlay}
          pagination
          paginationPageSize={25}
        />
      </div>
    </div>
  );
}
