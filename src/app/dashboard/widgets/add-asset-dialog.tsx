"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AssetType = "LAPTOP" | "MONITOR" | "LICENSE" | "OTHER";
type AssetStatus = "IN_STOCK" | "ASSIGNED" | "RETIRED";

type CreatedAsset = {
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

export default function AddAssetDialog({
  onCreated,
}: {
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

  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);
  const showPreview = useMemo(
    () => isProbablyUrl(imageUrl) && !imgBroken,
    [imageUrl, imgBroken],
  );

  function resetForm() {
    setType("LAPTOP");
    setStatus("IN_STOCK");
    setName("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setImageUrl("");
    setNotes("");
    setDescription("");
    setError(null);
    setImgBroken(false);
    setSaving(false);
    setGenerating(false);
  }

  // Reset when closing
  useEffect(() => {
    if (!open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function generateDescription() {
    if (!canSubmit) return;

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
    if (!canSubmit) return;

    setSaving(true);
    setError(null);

    try {
      const created = await fetchJson<CreatedAsset>("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          status,
          name: name.trim(),
          brand: brand.trim() || null,
          model: model.trim() || null,
          serialNumber: serialNumber.trim() || null,
          imageUrl: imageUrl.trim() || null,
          notes: notes.trim() || null,
          description: description.trim() || null,
        }),
      });

      onCreated(created);
      setOpen(false); // will trigger reset via effect
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Asset</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New asset</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Top controls */}
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>

          {/* Primary fields */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-1)]">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MacBook Pro 14 (M3)"
                />
                <p className="text-xs text-muted-foreground">
                  This is the label you’ll search for in the grid.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Brand</Label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Apple"
                  />
                </div>

                <div className="grid gap-1">
                  <Label>Model</Label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Axxxx"
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label>Serial</Label>
                <Input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Serial number"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-1)]">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImgBroken(false);
                  }}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste a public link (we’ll add real upload later).
                </p>
              </div>

              {imageUrl.trim() ? (
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-card">
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
                        <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                          {isProbablyUrl(imageUrl)
                            ? "No preview"
                            : "Invalid URL"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium">Preview</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {imageUrl.trim()}
                      </p>
                    </div>
                  </div>

                  {imgBroken ? (
                    <p className="mt-2 text-xs text-destructive">
                      Image could not be loaded. Check the URL.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Notes + description */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-1)]">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional internal notes…"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-3">
                  <Label>Description (editable)</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateDescription}
                    disabled={busy || !canSubmit}
                  >
                    {generating ? "Generating…" : "Generate (AI)"}
                  </Button>
                </div>

                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="AI-generated description will appear here…"
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : null}

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={busy || !canSubmit}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
