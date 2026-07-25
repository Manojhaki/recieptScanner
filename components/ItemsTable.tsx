"use client";

import type { ExtractedReceipt, ReceiptItem } from "@/lib/types";

interface ItemsTableProps {
  receipt: ExtractedReceipt;
  onChange: (receipt: ExtractedReceipt) => void;
}

const emptyItem: ReceiptItem = { name: "", quantity: 1, unitPrice: 0, totalPrice: 0 };

export default function ItemsTable({ receipt, onChange }: ItemsTableProps) {
  function updateItem(index: number, patch: Partial<ReceiptItem>) {
    const items = receipt.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ ...receipt, items });
  }

  function removeItem(index: number) {
    onChange({ ...receipt, items: receipt.items.filter((_, i) => i !== index) });
  }

  function addItem() {
    onChange({ ...receipt, items: [...receipt.items, { ...emptyItem }] });
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-3xl">
      <div className="flex gap-4 text-sm">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-zinc-500">Vendor</span>
          <input
            className="border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
            value={receipt.vendor}
            onChange={(e) => onChange({ ...receipt, vendor: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-zinc-500">Date</span>
          <input
            className="border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
            value={receipt.date}
            onChange={(e) => onChange({ ...receipt, date: e.target.value })}
          />
        </label>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-zinc-500 border-b dark:border-zinc-700">
            <th className="py-1 pr-2">Item</th>
            <th className="py-1 pr-2 w-20">Qty</th>
            <th className="py-1 pr-2 w-28">Unit Price</th>
            <th className="py-1 pr-2 w-28">Total</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, i) => (
            <tr key={i} className="border-b dark:border-zinc-800">
              <td className="py-1 pr-2">
                <input
                  className="w-full border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
                  value={item.totalPrice}
                  onChange={(e) => updateItem(i, { totalPrice: Number(e.target.value) })}
                />
              </td>
              <td className="py-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addItem}
        className="self-start text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        + Add item
      </button>

      <label className="flex flex-col gap-1 text-sm w-40">
        <span className="text-zinc-500">Receipt Total</span>
        <input
          type="number"
          step="0.01"
          className="border rounded px-2 py-1 dark:bg-zinc-900 dark:border-zinc-700"
          value={receipt.receiptTotal}
          onChange={(e) => onChange({ ...receipt, receiptTotal: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
