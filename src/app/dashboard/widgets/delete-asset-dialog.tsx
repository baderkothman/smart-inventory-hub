"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }
  if (!text) throw new Error("Empty response body");

  return JSON.parse(text) as T;
}

export default function DeleteAssetDialog({
  open,
  onOpenChange,
  assetId,
  assetName,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string | null;
  assetName: string | null;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    if (!assetId) return;

    setBusy(true);
    try {
      await fetchJson<{ ok: boolean }>(`/api/assets/${assetId}`, {
        method: "DELETE",
      });
      onDeleted(assetId);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            This will permanently delete{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {assetName ?? "this asset"}
            </span>
            .
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              onClick={doDelete}
              disabled={busy || !assetId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
