import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { assets, inventories } from "@/db/schema";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function toIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return v;
}

function normalizeRow(row: Record<string, unknown>) {
  return {
    ...row,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const params = await Promise.resolve(ctx.params as { id: string });
  const id = String(params?.id ?? "").trim();
  if (!id) return jsonError("Not found", 404);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Rename
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return jsonError("Name cannot be empty", 400);

    const rows = await db
      .update(inventories)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(inventories.id, id), eq(inventories.userId, userId)))
      .returning();

    if (!rows[0]) return jsonError("Not found", 404);
    return NextResponse.json(normalizeRow(rows[0] as Record<string, unknown>));
  }

  // Set as default
  if (body.isDefault === true) {
    // Unset current default for this user
    await db
      .update(inventories)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(inventories.userId, userId));

    // Set this inventory as default
    const rows = await db
      .update(inventories)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(inventories.id, id), eq(inventories.userId, userId)))
      .returning();

    if (!rows[0]) return jsonError("Not found", 404);
    return NextResponse.json(normalizeRow(rows[0] as Record<string, unknown>));
  }

  return jsonError("Nothing to update", 400);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const params = await Promise.resolve(ctx.params as { id: string });
  const id = String(params?.id ?? "").trim();
  if (!id) return jsonError("Not found", 404);

  // Verify ownership
  const [inv] = await db
    .select()
    .from(inventories)
    .where(and(eq(inventories.id, id), eq(inventories.userId, userId)));

  if (!inv) return jsonError("Not found", 404);

  // Block if inventory contains assets
  const [{ assetCount }] = await db
    .select({ assetCount: count() })
    .from(assets)
    .where(eq(assets.inventoryId, id));

  if (assetCount > 0) {
    return jsonError(
      `Cannot delete inventory with ${assetCount} asset(s). Move or delete them first.`,
      409,
    );
  }

  // Block if this is the only inventory
  const allRows = await db
    .select({ id: inventories.id, isDefault: inventories.isDefault })
    .from(inventories)
    .where(eq(inventories.userId, userId));

  if (allRows.length <= 1) {
    return jsonError("Cannot delete the only inventory.", 409);
  }

  await db
    .delete(inventories)
    .where(and(eq(inventories.id, id), eq(inventories.userId, userId)));

  // If we deleted the default, promote the next one
  if (inv.isDefault) {
    const next = allRows.find((r) => r.id !== id);
    if (next) {
      await db
        .update(inventories)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(inventories.id, next.id));
    }
  }

  return NextResponse.json({ id });
}
