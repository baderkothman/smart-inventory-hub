import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { assets, inventories } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action ?? "");
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((id: unknown) => typeof id === "string" && id)
    : [];

  if (!ids.length)
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });

  if (action === "delete") {
    await db
      .delete(assets)
      .where(
        and(eq(assets.createdByUserId, userId), inArray(assets.id, ids)),
      );
    return NextResponse.json({ deleted: ids.length });
  }

  if (action === "move") {
    const inventoryId = String(body?.inventoryId ?? "").trim();
    if (!inventoryId)
      return NextResponse.json(
        { error: "inventoryId required for move" },
        { status: 400 },
      );

    // Verify the target inventory belongs to the user
    const [inv] = await db
      .select({ id: inventories.id })
      .from(inventories)
      .where(
        and(eq(inventories.id, inventoryId), eq(inventories.userId, userId)),
      );

    if (!inv)
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 },
      );

    await db
      .update(assets)
      .set({ inventoryId, updatedAt: new Date() })
      .where(
        and(eq(assets.createdByUserId, userId), inArray(assets.id, ids)),
      );

    return NextResponse.json({ moved: ids.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
