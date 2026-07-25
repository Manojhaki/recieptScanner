"use client";

import { useState } from "react";
import ReceiptUploader from "@/components/ReceiptUploader";
import ItemsTable from "@/components/ItemsTable";
import type { ExtractedReceipt } from "@/lib/types";

export default function Home() {
  const [receipt, setReceipt] = useState<ExtractedReceipt | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  async function handleExtract(file: File) {
    setError(null);
    setSheetUrl(null);
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail ? `${data.error}: ${data.detail}` : data.error || "Extraction failed"
        );
      }
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleExport() {
    if (!receipt) return;
    setError(null);
    setIsExporting(true);
    try {
      const res = await fetch("/api/sheets/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receipt),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail ? `${data.error}: ${data.detail}` : data.error || "Export failed"
        );
      }
      setSheetUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-8 py-16 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Receipt Scanner</h1>
        <p className="text-sm text-zinc-500">
          Scan a Restaurant Depot receipt and export it as an itemized Google Sheet.
        </p>
      </div>

      <ReceiptUploader onExtract={handleExtract} isExtracting={isExtracting} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {receipt && (
        <>
          <ItemsTable receipt={receipt} onChange={setReceipt} />

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-md bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-medium disabled:opacity-40"
          >
            {isExporting ? "Exporting..." : "Export to Google Sheet"}
          </button>

          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline text-blue-600 dark:text-blue-400"
            >
              Open spreadsheet →
            </a>
          )}
        </>
      )}
    </main>
  );
}
