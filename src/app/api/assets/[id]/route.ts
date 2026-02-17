import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

function toIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return v;
}

function normalizeAssetRow(row: any) {
  return {
    ...row,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const [row] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeAssetRow(row));
  } catch (err) {
    console.error("GET /api/assets/[id] failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const data = await req.json();

    const name = data?.name != null ? String(data.name).trim() : null;

    const [updated] = await db
      .update(assets)
      .set({
        type: data.type,
        name: name ?? undefined,
        brand: data.brand ?? null,
        model: data.model ?? null,
        serialNumber: data.serialNumber ?? null,
        status: data.status ?? "IN_STOCK",
        assignedToUserId: data.assignedToUserId ?? null,
        purchaseDate: data.purchaseDate ?? null,
        warrantyEndDate: data.warrantyEndDate ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
        imageUrl: data.imageUrl ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeAssetRow(updated));
  } catch (err) {
    console.error("PATCH /api/assets/[id] failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const [deleted] = await db
      .delete(assets)
      .where(and(eq(assets.id, id), eq(assets.createdByUserId, userId)))
      .returning({ id: assets.id });

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ id: deleted.id });
  } catch (err) {
    console.error("DELETE /api/assets/[id] failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
