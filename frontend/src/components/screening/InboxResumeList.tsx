"use client";

import { Inbox, Loader2, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchInboxResumes } from "@/lib/api";
import type { InboxResume } from "@/lib/types";

interface InboxResumeListProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

type LoadStatus = "loading" | "ready" | "error";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function InboxResumeList({ selectedIds, onChange }: InboxResumeListProps) {
  const [resumes, setResumes] = useState<InboxResume[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  async function load() {
    setStatus("loading");
    try {
      const data = await fetchInboxResumes();
      setResumes(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  return (
    <div
      className="animate-fade-in-up space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover"
      style={{ animationDelay: "160ms" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Inbox className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <h2 className="font-display text-base font-bold text-slate-900">From inbox</h2>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label="Refresh inbox resumes"
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} strokeWidth={2.25} />
        </button>
      </div>

      {selectedIds.length > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
          {selectedIds.length} selected
        </span>
      )}

      {status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Loading...
        </div>
      )}

      {status === "error" && (
        <p className="text-xs text-slate-400">
          Couldn&apos;t load inbox resumes right now. Uploads still work fine below.
        </p>
      )}

      {status === "ready" && resumes.length === 0 && (
        <p className="text-xs text-slate-400">No resumes have arrived by email yet.</p>
      )}

      {status === "ready" && resumes.length > 0 && (
        <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {resumes.map((resume) => {
            const checked = selectedIds.includes(resume.id);
            return (
              <li key={resume.id}>
                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    checked ? "border-brand-300 bg-brand-50/60" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(resume.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {resume.senderName || resume.senderEmail}
                    </p>
                    <p className="truncate text-xs text-slate-500">{resume.subject}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{resume.fileName}</span>
                      <span className="shrink-0">· {timeAgo(resume.receivedAt)}</span>
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
