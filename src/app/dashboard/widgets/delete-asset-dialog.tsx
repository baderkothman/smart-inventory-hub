"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!open) {
      setBusy(false);
      setConfirmText("");
      setError(null);
    }
  }, [open]);

  const canDelete = useMemo(() => {
    return !!assetId && confirmText.trim().toUpperCase() === "DELETE" && !busy;
  }, [assetId, confirmText, busy]);

  async function doDelete() {
    if (!assetId || !canDelete) return;

    setBusy(true);
    setError(null);

    try {
      await fetchJson<{ id: string }>(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      onDeleted(assetId);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete the asset. Please try again.",
      );
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
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-foreground">
              This action is <span className="font-semibold">permanent</span>.
              It will delete{" "}
              <span className="font-semibold">{assetName ?? "this asset"}</span>{" "}
              from your inventory.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-semibold">DELETE</span> to confirm.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={doDelete}
            disabled={!canDelete}
          >
            {busy ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
