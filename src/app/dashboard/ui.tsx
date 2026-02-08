"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ModuleRegistry } from "ag-grid-community";
import { Button } from "@/components/ui/button";
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

export default function DashboardClient() {
  const [rows, setRows] = useState<AssetRow[] | null>(null);
  const [loading, setLoading] = useState(true);

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
    setRows(null); // Triggers AG Grid loading overlay
    const res = await fetch("/api/assets");
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Smart Inventory Hub</h1>
        <AddAssetDialog
          onCreated={(created) => setRows((prev) => [created, ...(prev ?? [])])}
        />
      </div>

      <div className="ag-theme-quartz" style={{ height: 650, width: "100%" }}>
        <AgGridReact<AssetRow>
          rowData={rows}
          columnDefs={colDefs}
          loadingOverlayComponent={() => (
            <div className="flex items-center justify-center h-full">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}
          quickFilterText={""}
          pagination
          paginationPageSize={25}
        />
      </div>

      <Button variant="secondary" onClick={refresh}>
        Refresh
      </Button>
    </div>
  );
}
