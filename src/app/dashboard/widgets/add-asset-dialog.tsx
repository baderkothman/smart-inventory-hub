"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type CreatedAsset = any;

export default function AddAssetDialog({
  onCreated,
}: {
  onCreated: (row: CreatedAsset) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [type, setType] = useState("LAPTOP");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  async function generateDescription() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/asset-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, brand, model, serialNumber, notes }),
      });
      const data = await res.json();
      setDescription(data.description ?? "");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!canSubmit) return;

    setBusy(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          brand: brand || null,
          model: model || null,
          serialNumber: serialNumber || null,
          notes: notes || null,
          description: description || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create asset");
      const created = await res.json();

      onCreated(created);
      setOpen(false);

      // reset
      setType("LAPTOP");
      setName("");
      setBrand("");
      setModel("");
      setSerialNumber("");
      setNotes("");
      setDescription("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Asset</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New Asset</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Type</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="LAPTOP / MONITOR / LICENSE / OTHER"
            />
          </div>

          <div className="grid gap-1">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MacBook Pro 14 (M3)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            />
          </div>

          <div className="grid gap-1">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={generateDescription}
              disabled={busy || !canSubmit}
            >
              Generate Description (AI)
            </Button>
            <Button type="button" onClick={save} disabled={busy || !canSubmit}>
              Save
            </Button>
          </div>

          <div className="grid gap-1">
            <Label>Description (editable)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
