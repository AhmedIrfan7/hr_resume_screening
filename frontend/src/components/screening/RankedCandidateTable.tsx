import { ChevronRight } from "lucide-react";
import { classificationClass, classificationIcon, scoreGradient } from "@/lib/candidateStyles";
import type { Candidate } from "@/lib/types";

interface RankedCandidateTableProps {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

const MEDAL_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-soft",
  2: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700 shadow-soft",
  3: "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 shadow-soft",
};

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDAL_STYLES[rank];
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
        medal || "bg-slate-100 text-slate-500"
      }`}
    >
      {rank}
    </span>
  );
}

export function RankedCandidateTable({ candidates, onSelect }: RankedCandidateTableProps) {
  return (
    <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-card backdrop-blur-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">
              Rank
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">
              Candidate
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">
              Score
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">
              Fit
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-slate-500">
              Experience
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-slate-500">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((candidate, index) => {
            const Icon = classificationIcon(candidate.classification);
            return (
              <tr
                key={candidate.fileName}
                onClick={() => onSelect(candidate)}
                className="group animate-fade-in-up cursor-pointer transition-colors hover:bg-brand-50/50"
                style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={candidate.rank} />
                </td>
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
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${scoreGradient(
                          candidate.score
                        )}`}
                        style={{ width: `${Math.min(100, candidate.score)}%` }}
                      />
                    </div>
                    <span className="font-medium tabular-nums text-slate-700">{candidate.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${classificationClass(
                      candidate.classification
                    )}`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2.5} />
                    {candidate.classification || "Unclassified"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {candidate.yearsExperience ? `${candidate.yearsExperience} yrs` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(candidate);
                    }}
                    className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-600 transition-transform group-hover:translate-x-0.5 hover:text-brand-700"
                  >
                    View
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
