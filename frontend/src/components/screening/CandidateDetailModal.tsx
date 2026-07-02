import { Award, GraduationCap, Mail, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { classificationClass, classificationIcon } from "@/lib/candidateStyles";
import type { Candidate } from "@/lib/types";

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
}

interface ScoreRowProps {
  label: string;
  value: number;
  max: number;
}

function ScoreRow({ label, value, max }: ScoreRowProps) {
  const [mounted, setMounted] = useState(false);
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700 ease-out"
          style={{ width: mounted ? `${percent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function bulletList(text: string): string[] {
  return text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export function CandidateDetailModal({ candidate, onClose }: CandidateDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const Icon = classificationIcon(candidate.classification);
  const displayName = candidate.candidateName || candidate.fileName;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Candidate details for ${displayName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl origin-center animate-scale-in overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-card">
              {initials(displayName)}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{displayName}</h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                {candidate.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {candidate.phone}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close candidate details"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classificationClass(
              candidate.classification
            )}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2.5} />
            {candidate.classification || "Unclassified"}
          </span>
          <span className="text-sm font-medium text-slate-700">
            Overall score: <span className="tabular-nums text-brand-600">{candidate.score}</span>/100
          </span>
        </div>

        <p className="mb-5 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          {candidate.summary}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          <ScoreRow label="Skills match" value={candidate.skillMatchScore} max={30} />
          <ScoreRow label="Experience" value={candidate.experienceScore} max={25} />
          <ScoreRow label="Achievements" value={candidate.achievementScore} max={20} />
          <ScoreRow label="Education" value={candidate.educationScore} max={10} />
          <ScoreRow label="Resume clarity" value={candidate.clarityScore} max={15} />
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Strengths
            </h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {bulletList(candidate.strengths).map((s) => (
                <li key={s} className="flex gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Gaps
            </h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {bulletList(candidate.gaps).map((g) => (
                <li key={g} className="flex gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-5 rounded-lg border border-brand-100 bg-brand-50/60 p-3.5 text-sm text-slate-700">
          <span className="font-semibold text-brand-800">Recommendation: </span>
          {candidate.recommendation}
        </div>

        <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-slate-500">
              <Award className="h-3.5 w-3.5" /> Experience
            </dt>
            <dd className="mt-0.5 text-slate-700">
              {candidate.yearsExperience ? `${candidate.yearsExperience} years` : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-slate-500">
              <GraduationCap className="h-3.5 w-3.5" /> Education
            </dt>
            <dd className="mt-0.5 text-slate-700">{candidate.education || "Not specified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Skills</dt>
            <dd className="mt-0.5 text-slate-700">{candidate.skills || "Not specified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Certifications</dt>
            <dd className="mt-0.5 text-slate-700">{candidate.certifications || "None listed"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
