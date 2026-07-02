import { FileDown, ShieldCheck, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "AI-powered scoring" },
  { icon: ShieldCheck, label: "Explainable, per-candidate reasoning" },
  { icon: FileDown, label: "Ranked results + CSV export" },
];

export function Hero() {
  return (
    <div className="mb-8 animate-fade-in-up text-center sm:mb-10">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-700 shadow-soft ring-1 ring-inset ring-brand-100">
        <Sparkles className="h-3 w-3" strokeWidth={2.5} />
        AI resume screening
      </span>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Shortlist candidates in{" "}
        <span className="bg-gradient-to-r from-brand-600 via-fuchsia-600 to-brand-500 bg-clip-text text-transparent">
          minutes, not hours
        </span>
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-balance text-sm text-slate-500 sm:text-base">
        Paste a job description, drop in a stack of resumes, and get back a ranked, explainable
        shortlist — no manual reading required.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
          >
            <Icon className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.25} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
