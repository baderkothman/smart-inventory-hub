import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { assets, inventories } from "@/db/schema";

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

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const inventoryId = url.searchParams.get("inventoryId");

    const conditions = [eq(assets.createdByUserId, userId)];
    if (inventoryId) {
      conditions.push(eq(assets.inventoryId, inventoryId));
    }

    const rows = await db
      .select()
      .from(assets)
      .where(and(...conditions))
      .orderBy(desc(assets.createdAt));

    return NextResponse.json(rows.map(normalizeAssetRow));
  } catch (err) {
    console.error("GET /api/assets failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const name = String(data?.name ?? "").trim();
    const type = String(data?.type ?? "").trim();
    const inventoryId = String(data?.inventoryId ?? "").trim();

    if (!name || !type || !inventoryId) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, inventoryId" },
        { status: 400 },
      );
    }

    // Verify the inventory belongs to this user
    const [inv] = await db
      .select({ id: inventories.id })
      .from(inventories)
      .where(
        and(eq(inventories.id, inventoryId), eq(inventories.userId, userId)),
      );

    if (!inv) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 },
      );
    }

    const quantity =
      typeof data?.quantity === "number"
        ? Math.max(0, Math.floor(data.quantity))
        : 0;

    const [created] = await db
      .insert(assets)
      .values({
        createdByUserId: userId,
        inventoryId,
        type: data.type,
        name,
        brand: data.brand ?? null,
        model: data.model ?? null,
        serialNumber: data.serialNumber ?? null,
        imageUrl: data.imageUrl ?? null,
        status: data.status ?? "IN_STOCK",
        assignedToUserId: data.assignedToUserId ?? null,
        quantity,
        purchaseDate: data.purchaseDate ?? null,
        warrantyEndDate: data.warrantyEndDate ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
      })
      .returning();

    return NextResponse.json(normalizeAssetRow(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/assets failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
