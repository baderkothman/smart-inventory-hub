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

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type CreatedAsset = {
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

export default function AddAssetDialog({
  inventoryId,
  onCreated,
}: {
  inventoryId: string;
  onCreated: (row: CreatedAsset) => void;
}) {
  const [open, setOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const busy = saving || generating;

  const [error, setError] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

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

  const showPreview = useMemo(
    () => isProbablyUrl(imageUrl) && !imgBroken,
    [imageUrl, imgBroken],
  );

  const showInvalidUrlHint = useMemo(() => {
    const v = imageUrl.trim();
    return v.length > 0 && !isProbablyUrl(v);
  }, [imageUrl]);

  function resetForm() {
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
    setImgBroken(false);
    setSaving(false);
    setGenerating(false);
  }

  useEffect(() => {
    if (!open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function generateDescription() {
    if (name.trim().length === 0 || busy) return;

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
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Failed to generate description. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (name.trim().length === 0 || busy) return;

    setSaving(true);
    setError(null);

    try {
      const qty = Math.max(0, Math.floor(Number(quantity) || 0));

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
          quantity: qty,
          notes: notes.trim() || null,
          description: description.trim() || null,
        }),
      });

      onCreated(created);
      setOpen(false);
    } catch (e) {
      console.error(e);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New asset</DialogTitle>
            <DialogDescription>
              Add the essentials first. You can refine details later.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            {/* Essentials */}
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1 md:col-span-2">
                  <Label htmlFor="asset-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="asset-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MacBook Pro 14 (M3)"
                    autoFocus
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
                          {labelize(t)}
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
                          {labelize(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="asset-brand">Brand</Label>
                  <Input
                    id="asset-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="asset-model">Model</Label>
                  <Input
                    id="asset-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="asset-qty">
                    Qty <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="asset-qty"
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1 md:col-span-2">
                  <Label htmlFor="asset-serial">Serial number</Label>
                  <Input
                    id="asset-serial"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="asset-image">Image URL</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="asset-image"
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
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="asset-description">Description</Label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateDescription}
                    disabled={busy || name.trim().length === 0}
                    className="h-8 px-2"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                <Textarea
                  id="asset-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Optional. You can generate this with AI, then edit."
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="asset-notes">Notes</Label>
                <Textarea
                  id="asset-notes"
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
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
