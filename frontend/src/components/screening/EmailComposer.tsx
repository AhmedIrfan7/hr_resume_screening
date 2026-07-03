"use client";

import { AlertCircle, CheckCircle2, ChevronLeft, Loader2, Mail, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendCandidateEmail } from "@/lib/api";
import type { Candidate, JobDetails } from "@/lib/types";

interface EmailComposerProps {
  candidate: Candidate;
  job: JobDetails;
  batchId: string;
  onClose: () => void;
}

type SendStatus = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:shadow-glow";

export function EmailComposer({ candidate, job, batchId, onClose }: EmailComposerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const displayName = candidate.candidateName || candidate.fileName;

  const [to, setTo] = useState(candidate.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendError, setSendError] = useState<string | null>(null);

  const canSend = to.trim().length > 0 && subject.trim().length > 0 && body.trim().length > 0;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSend() {
    setSendStatus("sending");
    setSendError(null);

    try {
      await sendCandidateEmail({
        to: to.trim(),
        subject: subject.trim(),
        body,
        candidateName: displayName,
        batchId,
        fileName: candidate.fileName,
      });
      setSendStatus("success");
    } catch (err) {
      setSendStatus("error");
      setSendError(err instanceof Error ? err.message : "Failed to send email. Please try again.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Email ${displayName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl origin-center animate-scale-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 p-6 backdrop-blur sm:p-7 sm:pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
              <Mail className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Email {displayName}</h3>
              <p className="mt-0.5 text-xs text-slate-500">Job: {job.jobTitle || "Not specified"}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close email composer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6 sm:p-7 sm:pt-5">
          {sendStatus === "success" && (
            <p className="flex animate-fade-in items-start gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              Email sent to {to}.
            </p>
          )}

          {sendStatus === "error" && sendError && (
            <p className="flex animate-fade-in items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {sendError}
            </p>
          )}

          <div>
            <label htmlFor="composer-to" className="mb-1.5 block text-sm font-medium text-slate-700">
              To
            </label>
            <input
              id="composer-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="candidate@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="composer-subject" className="mb-1.5 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              id="composer-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Interview invitation"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="composer-body" className="mb-1.5 block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              id="composer-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the email yourself, or ask the AI assistant to draft one..."
              rows={10}
              className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
            Back
          </button>
          <button
            type="button"
            disabled={!canSend || sendStatus === "sending"}
            onClick={handleSend}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {sendStatus === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={2.25} />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
