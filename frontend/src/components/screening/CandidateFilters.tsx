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
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search candidates"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={classification}
          onChange={(e) => onClassificationChange(e.target.value)}
          aria-label="Filter by fit"
          className="w-full max-w-[10rem] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {CLASSIFICATIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <span className="text-sm text-slate-500">{resultCount} candidate(s)</span>
    </div>
  );
}
