import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const IdSchema = z.string().uuid();

const PatchSchema = z.object({
  type: z.enum(["LAPTOP", "MONITOR", "LICENSE", "OTHER"]).optional(),
  name: z.string().min(1).max(120).optional(),
  brand: z.string().max(120).nullable().optional(),
  model: z.string().max(120).nullable().optional(),
  serialNumber: z.string().max(200).nullable().optional(),
  status: z.enum(["IN_STOCK", "ASSIGNED", "RETIRED"]).optional(),
  assignedToUserId: z.string().max(200).nullable().optional(),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  warrantyEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  description: z.string().max(4000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const idParsed = IdSchema.safeParse(params.id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success)
    return jsonError("Validation error", 422, parsed.error.flatten());

  const patch = parsed.data;

  const [updated] = await db
    .update(assets)
    .set({
      ...patch,
      updatedAt: sql`now()`,
    })
    .where(and(eq(assets.id, params.id), eq(assets.createdByUserId, userId)))
    .returning();

  if (!updated) return jsonError("Not found", 404);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const idParsed = IdSchema.safeParse(params.id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  const [deleted] = await db
    .delete(assets)
    .where(and(eq(assets.id, params.id), eq(assets.createdByUserId, userId)))
    .returning();

  if (!deleted) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true });
}
