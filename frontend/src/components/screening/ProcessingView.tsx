interface ProcessingViewProps {
  processedCount: number;
  totalFiles: number;
  timedOut: boolean;
}

export function ProcessingView({ processedCount, totalFiles, timedOut }: ProcessingViewProps) {
  const percent = totalFiles > 0 ? Math.min(100, Math.round((processedCount / totalFiles) * 100)) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
        <span className="h-3 w-3 animate-ping rounded-full bg-brand-500" />
      </div>

      <h2 className="text-base font-semibold text-slate-900">
        {timedOut ? "Still processing — check back shortly" : "Screening resumes..."}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {processedCount} / {totalFiles} resumes processed
      </p>

      <div className="mx-auto mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {timedOut && (
        <p className="mt-4 text-xs text-slate-400">
          This can happen with large batches or slow AI responses. Results will keep filling in —
          reload later to see the full shortlist.
        </p>
      )}
    </div>
  );
}
