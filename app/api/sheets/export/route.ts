import { NextRequest, NextResponse } from "next/server";
import { exportReceiptToSheet } from "@/lib/googleSheets";
import type { ExtractedReceipt } from "@/lib/types";

export async function POST(req: NextRequest) {
  const receipt = (await req.json()) as ExtractedReceipt;
  if (!receipt || !Array.isArray(receipt.items)) {
    return NextResponse.json({ error: "Invalid receipt data" }, { status: 400 });
  }

  try {
    const url = await exportReceiptToSheet(receipt);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Sheet export failed", err);
    return NextResponse.json(
      { error: "Failed to export to Google Sheet" },
      { status: 502 }
    );
  }
}
