import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex animate-fade-in-up items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-card">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Resume<span className="text-brand-600">IQ</span>
          </span>
        </div>
        <span className="hidden animate-fade-in-up items-center gap-1.5 text-sm text-slate-500 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          AI-powered resume screening
        </span>
      </div>
    </header>
  );
}
