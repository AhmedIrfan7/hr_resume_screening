import { useEffect } from "react";
import { classificationClass } from "@/lib/candidateStyles";
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
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
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

export function CandidateDetailModal({ candidate, onClose }: CandidateDetailModalProps) {
  useEffect(() => {
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
      aria-label={`Candidate details for ${candidate.candidateName || candidate.fileName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {candidate.candidateName || candidate.fileName}
            </h3>
            <p className="text-sm text-slate-500">
              {candidate.email} {candidate.phone ? `· ${candidate.phone}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate details"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${classificationClass(
              candidate.classification
            )}`}
          >
            {candidate.classification || "Unclassified"}
          </span>
          <span className="text-sm font-medium text-slate-700">Overall score: {candidate.score}/100</span>
        </div>

        <p className="mb-5 text-sm text-slate-700">{candidate.summary}</p>

        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ScoreRow label="Skills match" value={candidate.skillMatchScore} max={30} />
          <ScoreRow label="Experience" value={candidate.experienceScore} max={25} />
          <ScoreRow label="Achievements" value={candidate.achievementScore} max={20} />
          <ScoreRow label="Education" value={candidate.educationScore} max={10} />
          <ScoreRow label="Resume clarity" value={candidate.clarityScore} max={15} />
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1 text-sm font-semibold text-emerald-700">Strengths</h4>
            <ul className="list-inside list-disc text-sm text-slate-600">
              {bulletList(candidate.strengths).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-amber-700">Gaps</h4>
            <ul className="list-inside list-disc text-sm text-slate-600">
              {bulletList(candidate.gaps).map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <span className="font-semibold">Recommendation: </span>
          {candidate.recommendation}
        </div>

        <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Experience</dt>
            <dd className="text-slate-700">
              {candidate.yearsExperience ? `${candidate.yearsExperience} years` : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Education</dt>
            <dd className="text-slate-700">{candidate.education || "Not specified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Skills</dt>
            <dd className="text-slate-700">{candidate.skills || "Not specified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Certifications</dt>
            <dd className="text-slate-700">{candidate.certifications || "None listed"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
