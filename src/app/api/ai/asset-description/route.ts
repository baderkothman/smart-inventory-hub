// src/app/api/ai/asset-description/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `
Write a concise, technical asset description for an IT inventory system.
Be specific, professional, and helpful for audits.
Return plain text (no markdown).

Asset:
- Type: ${body.type}
- Name: ${body.name}
- Brand: ${body.brand ?? "-"}
- Model: ${body.model ?? "-"}
- Serial: ${body.serialNumber ?? "-"}
- Notes: ${body.notes ?? "-"}
`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return NextResponse.json({ description: resp.text ?? "" });
}
