"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [busy, setBusy] = useState(false);

  const [type, setType] = useState<AssetRow["type"]>("LAPTOP");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<AssetRow["status"]>("IN_STOCK");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!asset) return;
    setType(asset.type);
    setName(asset.name ?? "");
    setBrand(asset.brand ?? "");
    setModel(asset.model ?? "");
    setSerialNumber(asset.serialNumber ?? "");
    setStatus(asset.status);
    setNotes(asset.notes ?? "");
    setDescription(asset.description ?? "");
  }, [asset, open]);

  const canSave = useMemo(
    () => name.trim().length > 0 && !!asset,
    [name, asset],
  );

  async function save() {
    if (!asset || !canSave) return;

    setBusy(true);
    try {
      const updated = await fetchJson<AssetRow>(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          brand: brand || null,
          model: model || null,
          serialNumber: serialNumber || null,
          status,
          notes: notes || null,
          description: description || null,
        }),
      });

      onUpdated(updated);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as AssetRow["type"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAPTOP">LAPTOP</SelectItem>
                <SelectItem value="MONITOR">MONITOR</SelectItem>
                <SelectItem value="LICENSE">LICENSE</SelectItem>
                <SelectItem value="OTHER">OTHER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Brand</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Model</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Serial</Label>
            <Input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as AssetRow["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">IN_STOCK</SelectItem>
                <SelectItem value="ASSIGNED">ASSIGNED</SelectItem>
                <SelectItem value="RETIRED">RETIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={busy || !canSave}>
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
