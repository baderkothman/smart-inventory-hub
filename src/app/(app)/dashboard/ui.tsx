"use client";

import type {
  ColDef,
  ICellRendererParams,
  RowDoubleClickedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AddAssetDialog from "./widgets/add-asset-dialog";
import DeleteAssetDialog from "./widgets/delete-asset-dialog";
import EditAssetDialog from "./widgets/edit-asset-dialog";

ModuleRegistry.registerModules([AllCommunityModule]);

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type AssetRow = {
  id: string;
  inventoryId: string;
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

type Inventory = {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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

  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className="flex items-center justify-center">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary text-xs font-semibold text-secondary-foreground">
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

function RowMenuCell(
  props: ICellRendererParams<AssetRow, unknown> & {
    onEdit: (row: AssetRow) => void;
    onDelete: (row: AssetRow) => void;
  },
) {
  const row = props.data;
  if (!row) return null;

  const stopRowEvents = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-end pr-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onPointerDown={stopRowEvents}
            onClick={stopRowEvents}
            aria-label="Row actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => props.onEdit(row)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => props.onDelete(row)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ── Inventory management dialogs ─────────────────────────────── */

function CreateInventoryDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (inv: Inventory) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setSaving(false);
      setError(null);
    }
  }, [open]);

  async function save() {
    const n = name.trim();
    if (!n || saving) return;
    setSaving(true);
    setError(null);
    try {
      const created = await fetchJson<Inventory>("/api/inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      onCreated(created);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create inventory.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New inventory</DialogTitle>
          <DialogDescription>Give it a clear, short name.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="inv-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IT Equipment"
              autoFocus
            />
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameInventoryDialog({
  open,
  onOpenChange,
  inventory,
  onRenamed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventory: Inventory | null;
  onRenamed: (inv: Inventory) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && inventory) setName(inventory.name);
    if (!open) {
      setSaving(false);
      setError(null);
    }
  }, [open, inventory]);

  async function save() {
    const n = name.trim();
    if (!n || !inventory || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await fetchJson<Inventory>(
        `/api/inventories/${inventory.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: n }),
        },
      );
      onRenamed(updated);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rename.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename inventory</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="inv-rename">Name</Label>
            <Input
              id="inv-rename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteInventoryDialog({
  open,
  onOpenChange,
  inventory,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventory: Inventory | null;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setError(null);
    }
  }, [open]);

  async function doDelete() {
    if (!inventory || busy) return;
    setBusy(true);
    setError(null);
    try {
      await fetchJson(`/api/inventories/${inventory.id}`, { method: "DELETE" });
      onDeleted(inventory.id);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete inventory</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All assets must be removed first.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
            <p className="text-sm">
              Delete{" "}
              <span className="font-semibold">
                {inventory?.name ?? "this inventory"}
              </span>
              ?
            </p>
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={doDelete} disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main dashboard ────────────────────────────────────────────── */

export default function DashboardClient() {
  const [inventoriesData, setInventoriesData] = useState<Inventory[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );

  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AssetRow | null>(null);

  const [createInvOpen, setCreateInvOpen] = useState(false);
  const [renameInvOpen, setRenameInvOpen] = useState(false);
  const [deleteInvOpen, setDeleteInvOpen] = useState(false);

  /* ── Load inventories on mount ─────────────────────────────── */
  useEffect(() => {
    async function loadInventories() {
      setInvLoading(true);
      try {
        const data = await fetchJson<Inventory[]>("/api/inventories");
        setInventoriesData(data);
        const def = data.find((i) => i.isDefault) ?? data[0];
        if (def) setSelectedInventoryId(def.id);
      } catch (e) {
        console.error(e);
      } finally {
        setInvLoading(false);
      }
    }
    void loadInventories();
  }, []);

  /* ── Load assets when selected inventory changes ──────────── */
  const refresh = useCallback(async (inventoryId: string | null) => {
    if (!inventoryId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJson<AssetRow[]>(
        `/api/assets?inventoryId=${encodeURIComponent(inventoryId)}`,
      );
      setRows(data);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(selectedInventoryId);
  }, [refresh, selectedInventoryId]);

  const selectedInventory = useMemo(
    () => inventoriesData.find((i) => i.id === selectedInventoryId) ?? null,
    [inventoriesData, selectedInventoryId],
  );

  /* ── Grid callbacks ─────────────────────────────────────────── */
  const openEdit = useCallback((row: AssetRow) => {
    setActiveRow(row);
    setEditOpen(true);
  }, []);

  const openDelete = useCallback((row: AssetRow) => {
    setActiveRow(row);
    setDeleteOpen(true);
  }, []);

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
    const dateFmt = (p: ValueFormatterParams<AssetRow, unknown>) =>
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
      { field: "name", flex: 1, minWidth: 220 },
      { field: "brand", width: 150 },
      { field: "model", width: 150 },
      { field: "serialNumber", headerName: "Serial", width: 180 },
      { field: "quantity", headerName: "Qty", width: 90 },
      { field: "status", width: 130 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 210,
        valueFormatter: dateFmt,
      },
      {
        headerName: "",
        width: 64,
        pinned: "right",
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: RowMenuCell,
        cellRendererParams: {
          onEdit: (row: AssetRow) => openEdit(row),
          onDelete: (row: AssetRow) => openDelete(row),
        },
      },
    ];
  }, [openDelete, openEdit]);

  const onRowDoubleClicked = useCallback(
    (e: RowDoubleClickedEvent<AssetRow>) => {
      if (!e.data) return;
      openEdit(e.data);
    },
    [openEdit],
  );

  /* ── Inventory management handlers ─────────────────────────── */
  async function setAsDefault() {
    if (!selectedInventoryId) return;
    try {
      const updated = await fetchJson<Inventory>(
        `/api/inventories/${selectedInventoryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDefault: true }),
        },
      );
      setInventoriesData((prev) =>
        prev.map((i) => ({
          ...i,
          isDefault: i.id === updated.id,
        })),
      );
    } catch (e) {
      console.error(e);
    }
  }

  /* ── Empty state ────────────────────────────────────────────── */
  if (!invLoading && inventoriesData.length === 0) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Create your first inventory to start tracking assets.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-1)]">
          <p className="mb-4 text-sm text-muted-foreground">
            No inventories yet.
          </p>
          <Button onClick={() => setCreateInvOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create inventory
          </Button>
        </div>

        <CreateInventoryDialog
          open={createInvOpen}
          onOpenChange={setCreateInvOpen}
          onCreated={(inv) => {
            setInventoriesData([inv]);
            setSelectedInventoryId(inv.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory with a fast grid and minimal actions.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-[300px]">
            <Input
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search by name, brand, model, serial…"
              className="h-9"
            />
          </div>

          {selectedInventoryId && (
            <AddAssetDialog
              inventoryId={selectedInventoryId}
              onCreated={(created) => {
                setRows((prev) => [created, ...prev]);
              }}
            />
          )}
        </div>
      </div>

      {/* Inventory switcher bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-1)]">
        <span className="text-xs font-medium text-muted-foreground">
          Inventory
        </span>

        <Select
          value={selectedInventoryId ?? ""}
          onValueChange={setSelectedInventoryId}
          disabled={invLoading}
        >
          <SelectTrigger className="h-8 w-[200px] text-sm">
            <SelectValue placeholder="Select inventory…" />
          </SelectTrigger>
          <SelectContent>
            {inventoriesData.map((inv) => (
              <SelectItem key={inv.id} value={inv.id}>
                {inv.name}
                {inv.isDefault ? " (default)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setCreateInvOpen(true)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          New
        </Button>

        {selectedInventory && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={() => setRenameInvOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              {!selectedInventory.isDefault && (
                <DropdownMenuItem onSelect={() => void setAsDefault()}>
                  Set as default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setDeleteInvOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Grid surface */}
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {selectedInventory?.name ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? "Loading…" : `${rows.length} asset(s)`}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => void refresh(selectedInventoryId)}
            disabled={loading}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="p-3">
          <div
            className="ag-theme-quartz"
            style={{ height: 600, width: "100%" }}
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
              rowSelection="single"
              suppressCellFocus
              enableCellTextSelection
              onRowDoubleClicked={onRowDoubleClicked}
            />
          </div>
        </div>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Tip: double-click a row to edit. Use the "…" menu for delete.
        </div>
      </div>

      {/* Asset modals */}
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

      {/* Inventory modals */}
      <CreateInventoryDialog
        open={createInvOpen}
        onOpenChange={setCreateInvOpen}
        onCreated={(inv) => {
          setInventoriesData((prev) => [...prev, inv]);
          setSelectedInventoryId(inv.id);
        }}
      />

      <RenameInventoryDialog
        open={renameInvOpen}
        onOpenChange={setRenameInvOpen}
        inventory={selectedInventory}
        onRenamed={(updated) => {
          setInventoriesData((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i)),
          );
        }}
      />

      <DeleteInventoryDialog
        open={deleteInvOpen}
        onOpenChange={setDeleteInvOpen}
        inventory={selectedInventory}
        onDeleted={(id) => {
          const remaining = inventoriesData.filter((i) => i.id !== id);
          setInventoriesData(remaining);
          setSelectedInventoryId(remaining[0]?.id ?? null);
          setRows([]);
        }}
      />
    </div>
  );
}
