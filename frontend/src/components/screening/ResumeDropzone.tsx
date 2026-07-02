"use client";

import { AlertCircle, FileText, UploadCloud, X } from "lucide-react";
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

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    <div
      className="animate-fade-in-up space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover sm:p-7"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FileText className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <h2 className="font-display text-base font-bold text-slate-900">Resumes (PDF only)</h2>
        </div>
        {files.length > 0 && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {files.length} / {MAX_FILES}
          </span>
        )}
      </div>

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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          isDragActive
            ? "scale-[1.01] border-brand-500 bg-brand-50 shadow-glow"
            : "border-slate-300 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40"
        }`}
      >
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft transition-transform duration-300 ${
            isDragActive ? "scale-110" : ""
          }`}
        >
          <UploadCloud
            className={`h-5 w-5 transition-colors ${isDragActive ? "text-brand-600" : "text-slate-400"}`}
            strokeWidth={2}
          />
        </div>
        <p className="text-sm font-medium text-slate-700">
          {isDragActive ? "Drop resumes to upload" : "Drag and drop resumes here, or click to browse"}
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
        <ul className="space-y-1.5">
          {rejected.map((r) => (
            <li
              key={r.name}
              className="flex animate-fade-in items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                <span className="font-medium">{r.name}:</span> {r.reason}
              </span>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {files.map((file, index) => (
            <li
              key={file.name}
              className="flex animate-fade-in-up items-center justify-between gap-3 bg-white px-3.5 py-2.5 text-sm transition-colors hover:bg-slate-50"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="truncate text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                aria-label={`Remove ${file.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
