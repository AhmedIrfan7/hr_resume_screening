const CLASSIFICATION_STYLES: Record<string, string> = {
  "Strong Fit": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Fit: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Weak Fit": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Not Fit": "bg-red-50 text-red-700 ring-red-600/20",
};

export function classificationClass(classification: string): string {
  return CLASSIFICATION_STYLES[classification] || "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}
