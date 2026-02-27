"use client";

import type {
  CellClickedEvent,
  ColDef,
  SelectionChangedEvent,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  FolderInput,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import AssetPreviewPanel, {
  type PreviewAsset,
} from "./widgets/asset-preview-panel";
import DeleteAssetDialog from "./widgets/delete-asset-dialog";
import EditAssetDialog from "./widgets/edit-asset-dialog";

ModuleRegistry.registerModules([AllCommunityModule]);

const ALL_INV = "__all__";

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type AssetRow = {
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

function ImageCell({
  value,
  data,
}: {
  value: string | null;
  data?: AssetRow;
}) {
  const url = (value ?? "").trim();
  const name = data?.name ?? "Asset";
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className="flex items-center justify-center">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary text-xs font-semibold text-secondary-foreground">
          {getInitials(name)}
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

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(
      `${res.status} ${res.statusText} from ${
        typeof input === "string" ? input : "request"
      }: ${text.slice(0, 400)}`,
    );
  if (!text) throw new Error("Empty response body");
  return JSON.parse(text) as T;
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
      await fetchJson(`/api/inventories/${inventory.id}`, {
        method: "DELETE",
      });
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

function BulkMoveDialog({
  open,
  onOpenChange,
  count,
  inventories,
  onMove,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
  inventories: Inventory[];
  onMove: (inventoryId: string) => Promise<void>;
}) {
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTargetId("");
      setBusy(false);
      setError(null);
    }
  }, [open]);

  async function doMove() {
    if (!targetId || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onMove(targetId);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to move assets.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Move to inventory</DialogTitle>
          <DialogDescription>
            Move {count} selected item{count !== 1 ? "s" : ""} to a different
            inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Target inventory</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose inventory…" />
              </SelectTrigger>
              <SelectContent>
                {inventories.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name}
                    {inv.isDefault ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button onClick={doMove} disabled={!targetId || busy}>
            <FolderInput className="mr-1.5 h-4 w-4" />
            {busy ? "Moving…" : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main dashboard ────────────────────────────────────────────── */

export default function DashboardClient() {
  const gridRef = useRef<AgGridReact<AssetRow>>(null);

  const [inventoriesData, setInventoriesData] = useState<Inventory[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  // "all" is a special value meaning "show all inventories"
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );

  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AssetRow | null>(null);

  const [previewAsset, setPreviewAsset] = useState<PreviewAsset | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const [createInvOpen, setCreateInvOpen] = useState(false);
  const [renameInvOpen, setRenameInvOpen] = useState(false);
  const [deleteInvOpen, setDeleteInvOpen] = useState(false);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

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

  /* ── Load assets ────────────────────────────────────────────── */
  const refresh = useCallback(async (invId: string | null) => {
    if (!invId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const url =
        invId === ALL_INV
          ? "/api/assets"
          : `/api/assets?inventoryId=${encodeURIComponent(invId)}`;
      const data = await fetchJson<AssetRow[]>(url);
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
    () =>
      selectedInventoryId && selectedInventoryId !== ALL_INV
        ? (inventoriesData.find((i) => i.id === selectedInventoryId) ?? null)
        : null,
    [inventoriesData, selectedInventoryId],
  );

  function getInventoryName(invId: string | null): string | null {
    if (!invId) return null;
    return inventoriesData.find((i) => i.id === invId)?.name ?? null;
  }

  /* ── Selection ──────────────────────────────────────────────── */
  const onSelectionChanged = useCallback(
    (e: SelectionChangedEvent<AssetRow>) => {
      setSelectedRowIds(e.api.getSelectedRows().map((r) => r.id));
    },
    [],
  );

  /* ── Preview / edit triggers ────────────────────────────────── */
  const openEdit = useCallback((row: AssetRow) => {
    setActiveRow(row);
    setEditOpen(true);
  }, []);

  const openDelete = useCallback((row: AssetRow) => {
    setActiveRow(row);
    setDeleteOpen(true);
  }, []);

  const onCellClicked = useCallback(
    (e: CellClickedEvent<AssetRow>) => {
      // Checkbox column: only toggles selection, no preview
      if (e.colDef.checkboxSelection) return;
      if (!e.data) return;
      setPreviewAsset(e.data);
    },
    [],
  );

  /* ── Column definitions ─────────────────────────────────────── */
  const defaultColDef = useMemo<ColDef<AssetRow>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: true,
    }),
    [],
  );

  const showInvCol = selectedInventoryId === ALL_INV;

  const colDefs = useMemo<ColDef<AssetRow>[]>(() => {
    const dateFmt = (p: ValueFormatterParams<AssetRow, unknown>) =>
      formatDate(p.value);

    return [
      // Checkbox selection column
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        pinned: "left" as const,
        sortable: false,
        filter: false,
        resizable: false,
        suppressNavigable: true,
        headerName: "",
      },
      // Image
      {
        headerName: "",
        field: "imageUrl",
        width: 72,
        pinned: "left" as const,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ImageCell,
      },
      // Inventory (only in "All" view)
      ...(showInvCol
        ? [
            {
              field: "inventoryId" as const,
              headerName: "Inventory",
              width: 160,
              valueFormatter: (
                p: ValueFormatterParams<AssetRow, string | null>,
              ) => {
                if (!p.value) return "Unassigned";
                return getInventoryName(p.value) ?? "Unknown";
              },
            } satisfies ColDef<AssetRow>,
          ]
        : []),
      { field: "type", width: 130 },
      { field: "name", flex: 1, minWidth: 200 },
      { field: "brand", width: 140 },
      { field: "model", width: 140 },
      { field: "serialNumber", headerName: "Serial", width: 170 },
      { field: "quantity", headerName: "Qty", width: 80 },
      { field: "status", width: 130 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 200,
        valueFormatter: dateFmt,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInvCol, inventoriesData]);

  /* ── Inventory management handlers ─────────────────────────── */
  async function setAsDefault() {
    if (!selectedInventoryId || selectedInventoryId === ALL_INV) return;
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
        prev.map((i) => ({ ...i, isDefault: i.id === updated.id })),
      );
    } catch (e) {
      console.error(e);
    }
  }

  /* ── Bulk operations ────────────────────────────────────────── */
  async function bulkMove(inventoryId: string) {
    await fetchJson("/api/assets/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", ids: selectedRowIds, inventoryId }),
    });
    gridRef.current?.api.deselectAll();
    setSelectedRowIds([]);
    void refresh(selectedInventoryId);
    setPreviewAsset(null);
  }

  async function bulkDelete() {
    await fetchJson("/api/assets/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids: selectedRowIds }),
    });
    setRows((prev) => prev.filter((r) => !selectedRowIds.includes(r.id)));
    if (previewAsset && selectedRowIds.includes(previewAsset.id)) {
      setPreviewAsset(null);
    }
    gridRef.current?.api.deselectAll();
    setSelectedRowIds([]);
    setBulkDeleteConfirm(false);
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
          <div className="w-full sm:w-[280px]">
            <Input
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search by name, brand, model…"
              className="h-9"
            />
          </div>
          <AddAssetDialog
            inventories={inventoriesData}
            defaultInventoryId={
              selectedInventoryId !== ALL_INV ? selectedInventoryId : null
            }
            onCreated={(created) => {
              const visible =
                selectedInventoryId === ALL_INV ||
                created.inventoryId === selectedInventoryId ||
                (!created.inventoryId && !selectedInventoryId);
              if (visible) setRows((prev) => [created, ...prev]);
            }}
          />
        </div>
      </div>

      {/* Inventory switcher bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-1)]">
        <span className="text-xs font-medium text-muted-foreground">
          Inventory
        </span>

        <Select
          value={selectedInventoryId ?? ""}
          onValueChange={(v) => {
            setSelectedInventoryId(v);
            setPreviewAsset(null);
            setSelectedRowIds([]);
          }}
          disabled={invLoading}
        >
          <SelectTrigger className="h-8 w-[220px] text-sm">
            <SelectValue placeholder="Select inventory…" />
          </SelectTrigger>
          <SelectContent>
            {/* Virtual "All" option */}
            <SelectItem value={ALL_INV}>
              <span className="font-medium">All inventories</span>
            </SelectItem>
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
        {/* Grid header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {selectedInventoryId === ALL_INV
                ? "All inventories"
                : (selectedInventory?.name ?? "—")}
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
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Grid + preview split */}
        <div className="flex overflow-hidden">
          {/* Grid */}
          <div className={`p-3 ${previewAsset ? "min-w-0 flex-1" : "w-full"}`}>
            <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>
              <AgGridReact<AssetRow>
                ref={gridRef}
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
                rowSelection="multiple"
                suppressRowClickSelection
                suppressCellFocus
                enableCellTextSelection
                onSelectionChanged={onSelectionChanged}
                onCellClicked={onCellClicked}
              />
            </div>
          </div>

          {/* Preview panel */}
          {previewAsset && (
            <div
              className="w-[280px] shrink-0 overflow-hidden border-l border-border"
              style={{ height: 600 + 44 /* match grid + header */ }}
            >
              <AssetPreviewPanel
                asset={previewAsset}
                inventoryName={getInventoryName(previewAsset.inventoryId)}
                onEdit={(a) => openEdit(a as AssetRow)}
                onDelete={(a) => openDelete(a as AssetRow)}
                onClose={() => setPreviewAsset(null)}
              />
            </div>
          )}
        </div>

        {/* Bulk action bar */}
        {selectedRowIds.length > 0 && (
          <div className="flex items-center gap-3 border-t border-border bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium">
              {selectedRowIds.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setBulkMoveOpen(true)}
            >
              <FolderInput className="h-3.5 w-3.5" />
              Move to inventory
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => {
                gridRef.current?.api.deselectAll();
                setSelectedRowIds([]);
              }}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Footer tip */}
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Click a row to preview · Use checkboxes for multi-select ·{" "}
          {previewAsset
            ? "Preview open — Edit and Delete are in the panel."
            : "Select items for bulk move or delete."}
        </div>
      </div>

      {/* Asset dialogs */}
      <EditAssetDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setActiveRow(null);
        }}
        asset={activeRow}
        inventories={inventoriesData}
        onUpdated={(updated) => {
          setRows((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r)),
          );
          if (previewAsset?.id === updated.id)
            setPreviewAsset(updated as PreviewAsset);
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
          if (previewAsset?.id === id) setPreviewAsset(null);
        }}
      />

      {/* Bulk delete confirm */}
      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selectedRowIds.length} items?</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected assets. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setBulkDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void bulkDelete()}
            >
              Delete {selectedRowIds.length} items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk move */}
      <BulkMoveDialog
        open={bulkMoveOpen}
        onOpenChange={setBulkMoveOpen}
        count={selectedRowIds.length}
        inventories={inventoriesData}
        onMove={bulkMove}
      />

      {/* Inventory dialogs */}
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
          setPreviewAsset(null);
        }}
      />
    </div>
  );
}
