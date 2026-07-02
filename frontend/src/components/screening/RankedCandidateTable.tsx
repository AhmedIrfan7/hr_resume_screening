import type { Candidate } from "@/lib/types";

interface RankedCandidateTableProps {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

const CLASSIFICATION_STYLES: Record<string, string> = {
  "Strong Fit": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Fit: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Weak Fit": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Not Fit": "bg-red-50 text-red-700 ring-red-600/20",
};

function classificationClass(classification: string): string {
  return CLASSIFICATION_STYLES[classification] || "bg-slate-100 text-slate-600 ring-slate-500/20";
}

function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

export function RankedCandidateTable({ candidates, onSelect }: RankedCandidateTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">#</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">Candidate</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">Score</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">Fit</th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">Experience</th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-slate-500">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((candidate) => (
            <tr key={candidate.fileName} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500">{candidate.rank}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {candidate.candidateName || candidate.fileName}
                </div>
                <div className="text-xs text-slate-500">{candidate.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${scoreBarColor(candidate.score)}`}
                      style={{ width: `${Math.min(100, candidate.score)}%` }}
                    />
                  </div>
                  <span className="font-medium text-slate-700">{candidate.score}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${classificationClass(
                    candidate.classification
                  )}`}
                >
                  {candidate.classification || "Unclassified"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {candidate.yearsExperience ? `${candidate.yearsExperience} yrs` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(candidate)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
