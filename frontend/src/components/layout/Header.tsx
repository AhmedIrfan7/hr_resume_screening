export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            IQ
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            ResumeIQ
          </span>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">
          AI-powered resume screening
        </span>
      </div>
    </header>
  );
}
