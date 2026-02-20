// src/app/api/assets/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { assets } from "@/db/schema";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function serializeAsset(row: any) {
  return {
    ...row,
    createdAt:
      row?.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : row?.createdAt,
    updatedAt:
      row?.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : row?.updatedAt,
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const params = await Promise.resolve(ctx.params as any);
  const id = String(params?.id ?? "").trim();
  if (!id) return jsonError("Not found", 404);

  const rows = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)))
    .limit(1);

  const row = rows[0];
  if (!row) return jsonError("Not found", 404);

  return NextResponse.json(serializeAsset(row));
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const params = await Promise.resolve(ctx.params as any);
  const id = String(params?.id ?? "").trim();
  if (!id) return jsonError("Not found", 404);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Only allow fields your UI edits
  const patch: Record<string, unknown> = {
    type: body.type,
    status: body.status,
    name: typeof body.name === "string" ? body.name.trim() : body.name,
    brand: typeof body.brand === "string" ? body.brand.trim() : body.brand,
    model: typeof body.model === "string" ? body.model.trim() : body.model,
    serialNumber:
      typeof body.serialNumber === "string"
        ? body.serialNumber.trim()
        : body.serialNumber,
    imageUrl:
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : body.imageUrl,
    notes: typeof body.notes === "string" ? body.notes.trim() : body.notes,
    description:
      typeof body.description === "string"
        ? body.description.trim()
        : body.description,
    updatedAt: new Date(),
  };

  // Remove undefined keys so we don’t overwrite unintentionally
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

  const updatedRows = await db
    .update(assets)
    .set(patch as any)
    .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)))
    .returning();

  const updated = updatedRows[0];
  if (!updated) return jsonError("Not found", 404);

  return NextResponse.json(serializeAsset(updated));
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const params = await Promise.resolve(ctx.params as any);
  const id = String(params?.id ?? "").trim();
  if (!id) return jsonError("Not found", 404);

  const deletedRows = await db
    .delete(assets)
    .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)))
    .returning({ id: assets.id });

  const deleted = deletedRows[0];
  if (!deleted) return jsonError("Not found", 404);

  return NextResponse.json({ id: String(deleted.id) });
}
