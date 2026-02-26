"use client";

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

const TYPE_OPTIONS: AssetType[] = ["LAPTOP", "MONITOR", "LICENSE", "OTHER"];
const STATUS_OPTIONS: AssetStatus[] = ["IN_STOCK", "ASSIGNED", "RETIRED"];

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

function isProbablyUrl(value: string) {
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EditAssetDialog({
  open,
  onOpenChange,
  asset,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetRow | null;
  onUpdated: (updated: AssetRow) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  const [type, setType] = useState<AssetType>("LAPTOP");
  const [status, setStatus] = useState<AssetStatus>("IN_STOCK");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [quantity, setQuantity] = useState("0");

  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  const canSave = useMemo(
    () => !!asset && name.trim().length > 0 && !saving,
    [asset, name, saving],
  );

  const showPreview = useMemo(
    () => isProbablyUrl(imageUrl) && !imgBroken,
    [imageUrl, imgBroken],
  );

  const showInvalidUrlHint = useMemo(() => {
    const v = imageUrl.trim();
    return v.length > 0 && !isProbablyUrl(v);
  }, [imageUrl]);

  // Load asset into form when opened
  useEffect(() => {
    if (!open) {
      setSaving(false);
      setError(null);
      setImgBroken(false);
      return;
    }

    if (!asset) return;

    setType(asset.type);
    setStatus(asset.status);

    setName(asset.name ?? "");
    setBrand(asset.brand ?? "");
    setModel(asset.model ?? "");
    setSerialNumber(asset.serialNumber ?? "");
    setQuantity(String(asset.quantity ?? 0));

    setImageUrl(asset.imageUrl ?? "");
    setNotes(asset.notes ?? "");
    setDescription(asset.description ?? "");

    setError(null);
    setImgBroken(false);
  }, [asset, open]);

  async function save() {
    if (!asset || !canSave) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await fetchJson<AssetRow>(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      onUpdated(updated);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to update asset. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit asset</DialogTitle>
          <DialogDescription>
            Update key details. Keep it short—only what matters for inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Key fields */}
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-1 md:col-span-2">
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dell Latitude 5420"
                />
              </div>

              <div className="grid gap-1">
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as AssetType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="grid gap-1">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as AssetStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label>Brand</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-1">
                <Label>Model</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="edit-qty">Qty</Label>
                <Input
                  id="edit-qty"
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-1 md:col-span-2">
                <Label>Serial number</Label>
                <Input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-1">
                <Label>Image URL</Label>
                <div className="flex items-center gap-3">
                  <Input
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImgBroken(false);
                    }}
                    placeholder="https://..."
                  />

                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
                    {showPreview ? (
                      <img
                        src={imageUrl.trim()}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setImgBroken(true)}
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                        IMG
                      </div>
                    )}
                  </div>
                </div>

                {showInvalidUrlHint ? (
                  <p className="text-xs text-muted-foreground">
                    Enter a valid http(s) URL to show a preview.
                  </p>
                ) : null}

                {imgBroken && isProbablyUrl(imageUrl) ? (
                  <p className="text-xs text-destructive">
                    Image couldn't be loaded. Check the URL.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Optional. Keep it concise."
              />
            </div>

            <div className="grid gap-1">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Internal notes (optional)"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={!canSave}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
