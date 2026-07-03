"use client";

import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Mail,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { draftEmail, sendCandidateEmail } from "@/lib/api";
import type { Candidate, ChatMessage, JobDetails } from "@/lib/types";
import { ModalPortal } from "./ModalPortal";

interface EmailComposerProps {
  candidate: Candidate;
  job: JobDetails;
  batchId: string;
  onClose: () => void;
}

type SendStatus = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:shadow-glow";

const PRESETS = [
  { label: "Interview invite", instruction: "Write a warm interview invitation email for this candidate." },
  { label: "Rejection", instruction: "Write a polite, professional rejection email for this candidate." },
  {
    label: "Request more info",
    instruction: "Write an email asking this candidate for more information or clarification about their application.",
  },
  { label: "More formal", instruction: "Make the current draft more formal." },
  { label: "Shorten it", instruction: "Make the current draft shorter and more concise." },
];

export function EmailComposer({ candidate, job, batchId, onClose }: EmailComposerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const displayName = candidate.candidateName || candidate.fileName;

  const [to, setTo] = useState(candidate.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [sendError, setSendError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const canSend = to.trim().length > 0 && subject.trim().length > 0 && body.trim().length > 0;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isDrafting]);

  async function handleAskAI(instructionOverride?: string) {
    const instruction = (instructionOverride ?? chatInput).trim();
    if (!instruction || isDrafting) return;

    const priorHistory = chatMessages;
    setChatMessages([...priorHistory, { role: "user", text: instruction }]);
    setChatInput("");
    setIsDrafting(true);
    setDraftError(null);

    try {
      const result = await draftEmail({
        candidateName: displayName,
        candidateEmail: candidate.email,
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        score: candidate.score,
        classification: candidate.classification,
        summary: candidate.summary,
        strengths: candidate.strengths,
        gaps: candidate.gaps,
        recommendation: candidate.recommendation,
        currentSubject: subject,
        currentBody: body,
        userMessage: instruction,
        chatHistory: priorHistory,
      });
      setSubject(result.subject);
      setBody(result.body);
      setChatMessages((prev) => [...prev, { role: "assistant", text: result.assistantReply }]);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Failed to get a draft. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  }

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
    <ModalPortal>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Email ${displayName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl origin-center animate-scale-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
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

        <div className="grid flex-1 gap-0 overflow-hidden sm:grid-cols-2">
          <div className="space-y-4 overflow-y-auto border-b border-slate-100 p-6 sm:border-b-0 sm:border-r sm:p-7">
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
                placeholder="Write the email yourself, or ask the AI assistant on the right to draft one..."
                rows={12}
                className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
              />
            </div>
          </div>

          <div className="flex flex-col overflow-hidden bg-slate-50/60">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-3.5 sm:px-7">
              <Bot className="h-4 w-4 text-brand-600" strokeWidth={2.25} />
              <h4 className="font-display text-sm font-bold text-slate-900">AI writing assistant</h4>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-6 py-3 sm:px-7">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isDrafting}
                  onClick={() => handleAskAI(preset.instruction)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4 sm:px-7">
              {chatMessages.length === 0 && (
                <p className="rounded-lg bg-white p-3 text-xs text-slate-400 shadow-sm">
                  Ask me to draft an email, or pick a quick action above. I can see this candidate&apos;s
                  full screening report and the job description.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex animate-fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-bl-sm bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isDrafting && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Drafting...
                </div>
              )}
              {draftError && (
                <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {draftError}
                </p>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 p-3 sm:px-5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
                placeholder="Tell the assistant what to write..."
                disabled={isDrafting}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:shadow-glow disabled:opacity-60"
              />
              <button
                type="button"
                disabled={isDrafting || chatInput.trim().length === 0}
                onClick={() => handleAskAI()}
                aria-label="Ask AI"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
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
    </ModalPortal>
  );
}
