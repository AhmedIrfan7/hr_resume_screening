"use client";

import { useRef, useState } from "react";

const MAX_FILES = 15;
const MAX_SIZE_MB = 5;

interface ResumeDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
}

interface RejectedFile {
  name: string;
  reason: string;
}

export function ResumeDropzone({ files, onChange }: ResumeDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | File[]) {
    const accepted: File[] = [];
    const nextRejected: RejectedFile[] = [];

    for (const file of Array.from(incoming)) {
      if (file.type !== "application/pdf") {
        nextRejected.push({ name: file.name, reason: "Only PDF files are supported" });
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        nextRejected.push({ name: file.name, reason: `Exceeds ${MAX_SIZE_MB}MB limit` });
        continue;
      }
      accepted.push(file);
    }

    const combined = [...files, ...accepted];
    if (combined.length > MAX_FILES) {
      nextRejected.push({
        name: `${combined.length - MAX_FILES} file(s)`,
        reason: `Batch limit is ${MAX_FILES} resumes`,
      });
    }

    setRejected(nextRejected);
    onChange(combined.slice(0, MAX_FILES));
  }

  function removeFile(name: string) {
    onChange(files.filter((f) => f.name !== name));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Resumes (PDF only)</h2>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragActive ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <p className="text-sm font-medium text-slate-700">
          Drag and drop resumes here, or click to browse
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PDF only, up to {MAX_SIZE_MB}MB each, {MAX_FILES} resumes per batch
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rejected.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-red-600">
          {rejected.map((r) => (
            <li key={r.name}>
              {r.name}: {r.reason}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {files.map((file) => (
            <li key={file.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate text-slate-700">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                className="ml-3 text-xs font-medium text-slate-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
