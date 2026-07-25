import { NextRequest, NextResponse } from "next/server";
import { extractReceipt } from "@/lib/anthropic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  try {
    const receipt = await extractReceipt(
      base64,
      file.type as "image/jpeg" | "image/png" | "image/webp"
    );
    return NextResponse.json(receipt);
  } catch (err) {
    console.error("Receipt extraction failed", err);
    return NextResponse.json(
      { error: "Failed to extract receipt data" },
      { status: 502 }
    );
  }
}
