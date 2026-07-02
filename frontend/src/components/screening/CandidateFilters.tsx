import { ChevronDown, Search, Users } from "lucide-react";

const CLASSIFICATIONS = ["All", "Strong Fit", "Fit", "Weak Fit", "Not Fit"];

interface CandidateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  classification: string;
  onClassificationChange: (value: string) => void;
  resultCount: number;
}

export function CandidateFilters({
  search,
  onSearchChange,
  classification,
  onClassificationChange,
  resultCount,
}: CandidateFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search candidates"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:shadow-glow"
          />
        </div>
        <div className="relative w-full max-w-[11rem]">
          <select
            value={classification}
            onChange={(e) => onClassificationChange(e.target.value)}
            aria-label="Filter by fit"
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 shadow-sm outline-none transition-all hover:border-slate-400 focus:border-brand-500 focus:shadow-glow"
          >
            {CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-sm text-slate-500">
        <Users className="h-3.5 w-3.5" />
        {resultCount} candidate{resultCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
