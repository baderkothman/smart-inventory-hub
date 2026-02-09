import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select()
      .from(assets)
      .where(eq(assets.createdByUserId, userId))
      .orderBy(desc(assets.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/assets failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    const [created] = await db
      .insert(assets)
      .values({
        createdByUserId: userId,
        type: data.type,
        name: data.name,
        brand: data.brand ?? null,
        model: data.model ?? null,
        serialNumber: data.serialNumber ?? null,
        status: data.status ?? "IN_STOCK",
        assignedToUserId: data.assignedToUserId ?? null,
        purchaseDate: data.purchaseDate ?? null,
        warrantyEndDate: data.warrantyEndDate ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/assets failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 },
    );
  }
}
