import { Clock, ScanSearch } from "lucide-react";

interface ProcessingViewProps {
  processedCount: number;
  totalFiles: number;
  timedOut: boolean;
}

export function ProcessingView({ processedCount, totalFiles, timedOut }: ProcessingViewProps) {
  const percent = totalFiles > 0 ? Math.min(100, Math.round((processedCount / totalFiles) * 100)) : 0;

  return (
    <div className="animate-scale-in rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-card sm:p-14">
      <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
        {!timedOut && (
          <>
            <span className="absolute inset-0 rounded-full bg-brand-400/40 animate-pulse-ring" />
            <span
              className="absolute inset-0 rounded-full bg-brand-400/30 animate-pulse-ring"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
        <span
          className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-card ${
            timedOut ? "bg-amber-100 text-amber-600" : "bg-gradient-to-br from-brand-500 to-brand-700 text-white"
          }`}
        >
          {timedOut ? (
            <Clock className="h-6 w-6" strokeWidth={2} />
          ) : (
            <ScanSearch className="h-6 w-6" strokeWidth={2} />
          )}
        </span>
      </div>

      <h2 className="text-base font-semibold text-slate-900">
        {timedOut ? "Still processing — check back shortly" : "Screening resumes"}
        {!timedOut && <span className="inline-block w-6 text-brand-600">...</span>}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        <span className="font-semibold tabular-nums text-slate-700">{processedCount}</span> /{" "}
        <span className="tabular-nums">{totalFiles}</span> resumes processed
      </p>

      <div className="mx-auto mt-7 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-shimmer relative h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 bg-[length:200%_100%] transition-all duration-700 ease-out animate-shimmer"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium tabular-nums text-slate-400">{percent}%</p>

      {timedOut && (
        <p className="mx-auto mt-4 max-w-sm text-xs text-slate-400">
          This can happen with large batches or slow AI responses. Results will keep filling in —
          reload later to see the full shortlist.
        </p>
      )}
    </div>
  );
}
