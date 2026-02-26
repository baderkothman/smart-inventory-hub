// src/app/api/inventories/route.ts

import { currentUser } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: inventories.id,
        name: inventories.name,
        isDefault: inventories.isDefault,
        createdAt: inventories.createdAt,
        updatedAt: inventories.updatedAt,
      })
      .from(inventories)
      .where(eq(inventories.userId, userId))
      .orderBy(desc(inventories.isDefault), asc(inventories.createdAt));

    // Return an array (most dashboards expect this shape)
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("API_INVENTORIES_FAILED", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
