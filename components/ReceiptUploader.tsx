"use client";

import { useRef, useState } from "react";

interface ReceiptUploaderProps {
  onExtract: (file: File) => void;
  isExtracting: boolean;
}

export default function ReceiptUploader({ onExtract, isExtracting }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {preview ? (
          <img src={preview} alt="Receipt preview" className="max-h-64 rounded" />
        ) : (
          <span className="text-sm text-zinc-500 text-center">
            Click to select a receipt photo (JPEG, PNG, or WebP)
          </span>
        )}
      </label>

      <button
        type="button"
        disabled={!selectedFile || isExtracting}
        onClick={() => selectedFile && onExtract(selectedFile)}
        className="w-full rounded-md bg-black dark:bg-white text-white dark:text-black py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isExtracting ? "Extracting items..." : "Extract Items"}
      </button>
    </div>
  );
}
