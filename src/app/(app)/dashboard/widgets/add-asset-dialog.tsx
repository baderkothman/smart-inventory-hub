"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadField from "./image-upload-field";

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type Inventory = {
  id: string;
  name: string;
  isDefault: boolean;
};

type CreatedAsset = {
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

const TYPE_OPTIONS: AssetType[] = ["LAPTOP", "MONITOR", "LICENSE", "OTHER"];
const STATUS_OPTIONS: AssetStatus[] = ["IN_STOCK", "ASSIGNED", "RETIRED"];
const NO_INVENTORY = "__none__";

function labelize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
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
      `${res.status} ${res.statusText}: ${text.slice(0, 400)}`,
    );
  if (!text) throw new Error("Empty response body");
  return JSON.parse(text) as T;
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="shrink-0 font-mono text-[10px] font-semibold text-muted-foreground/50">
        {n}
      </span>
      <div className="h-px flex-1 bg-border/60" />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
    </div>
  );
}

export default function AddAssetDialog({
  inventories,
  defaultInventoryId,
  onCreated,
}: {
  inventories: Inventory[];
  defaultInventoryId?: string | null;
  onCreated: (row: CreatedAsset) => void;
}) {
  const [open, setOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const busy = saving || generating;

  const [error, setError] = useState<string | null>(null);

  const [selectedInvId, setSelectedInvId] = useState<string>(NO_INVENTORY);
  const [type, setType] = useState<AssetType>("LAPTOP");
  const [status, setStatus] = useState<AssetStatus>("IN_STOCK");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(
    () => name.trim().length > 0 && !busy,
    [name, busy],
  );

  function resetForm() {
    setSelectedInvId(defaultInventoryId ?? NO_INVENTORY);
    setType("LAPTOP");
    setStatus("IN_STOCK");
    setName("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setQuantity("1");
    setImageUrl("");
    setNotes("");
    setDescription("");
    setError(null);
    setSaving(false);
    setGenerating(false);
  }

  useEffect(() => {
    if (open) {
      setSelectedInvId(defaultInventoryId ?? NO_INVENTORY);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultInventoryId]);

  async function generateDescription() {
    if (!name.trim() || busy) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await fetchJson<{ description?: string }>(
        "/api/ai/asset-description",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            name: name.trim(),
            brand: brand.trim() || "",
            model: model.trim() || "",
            serialNumber: serialNumber.trim() || "",
            notes: notes.trim() || "",
          }),
        },
      );
      setDescription((data.description ?? "").trim());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to generate. Try again.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const inventoryId =
        selectedInvId && selectedInvId !== NO_INVENTORY
          ? selectedInvId
          : undefined;

      const created = await fetchJson<CreatedAsset>("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId,
          type,
          status,
          name: name.trim(),
          brand: brand.trim() || null,
          model: model.trim() || null,
          serialNumber: serialNumber.trim() || null,
          imageUrl: imageUrl.trim() || null,
          quantity: Math.max(0, Math.floor(Number(quantity) || 0)),
          notes: notes.trim() || null,
          description: description.trim() || null,
        }),
      });
      onCreated(created);
      setOpen(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create asset. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Add asset
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-2xl">
          {/* Sticky header */}
          <DialogHeader className="shrink-0 border-b border-border/70 px-6 py-5">
            <DialogTitle
              className="text-base font-semibold"
              style={{ fontFamily: "var(--font-syne), Syne, ui-sans-serif" }}
            >
              New asset
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add the essentials first — refine details any time.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable form */}
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="flex-1 overflow-y-auto">
              {/* 01 — Identity */}
              <div className="px-6 pb-5 pt-5">
                <SectionLabel n="01" label="Identity" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="add-name" className="text-xs font-medium">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="add-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. MacBook Pro 14 (M3)"
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Type</Label>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as AssetType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {labelize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Inventory selector */}
                <div className="mt-3 grid gap-1.5">
                  <Label className="text-xs font-medium">Inventory</Label>
                  <Select
                    value={selectedInvId}
                    onValueChange={setSelectedInvId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose inventory…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_INVENTORY}>
                        <span className="text-muted-foreground">
                          No specific inventory
                        </span>
                      </SelectItem>
                      {inventories.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.name}
                          {inv.isDefault ? " (default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 02 — Details */}
              <div className="border-t border-border/50 px-6 pb-5 pt-5">
                <SectionLabel n="02" label="Details" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as AssetStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {labelize(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="add-brand" className="text-xs font-medium">
                      Brand
                    </Label>
                    <Input
                      id="add-brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="add-model" className="text-xs font-medium">
                      Model
                    </Label>
                    <Input
                      id="add-model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="add-qty" className="text-xs font-medium">
                      Qty <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="add-qty"
                      type="number"
                      min="0"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>

              {/* 03 — Tracking */}
              <div className="border-t border-border/50 px-6 pb-5 pt-5">
                <SectionLabel n="03" label="Tracking" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="add-serial"
                      className="text-xs font-medium"
                    >
                      Serial number
                    </Label>
                    <Input
                      id="add-serial"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Image</Label>
                    <ImageUploadField
                      value={imageUrl}
                      onChange={setImageUrl}
                    />
                  </div>
                </div>
              </div>

              {/* 04 — Content */}
              <div className="border-t border-border/50 px-6 pb-6 pt-5">
                <SectionLabel n="04" label="Content" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor="add-description"
                        className="text-xs font-medium"
                      >
                        Description
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateDescription}
                        disabled={busy || !name.trim()}
                        className="h-7 gap-1.5 px-2 text-[11px]"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generating ? "Generating…" : "AI Generate"}
                      </Button>
                    </div>
                    <Textarea
                      id="add-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Optional — generate with AI above, then edit."
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="add-notes"
                      className="text-xs font-medium"
                    >
                      Notes
                    </Label>
                    <Textarea
                      id="add-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      placeholder="Internal notes (optional)"
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-border/70 bg-card/80 px-6 py-4 backdrop-blur-sm">
              {error && (
                <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit} className="h-9">
                  {saving ? "Saving…" : "Save asset"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
