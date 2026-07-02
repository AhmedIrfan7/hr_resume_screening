import { AlertTriangle, CheckCircle2, ThumbsUp, XCircle, type LucideIcon } from "lucide-react";

const CLASSIFICATION_STYLES: Record<string, string> = {
  "Strong Fit": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Fit: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Weak Fit": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Not Fit": "bg-red-50 text-red-700 ring-red-600/20",
};

const CLASSIFICATION_ICONS: Record<string, LucideIcon> = {
  "Strong Fit": CheckCircle2,
  Fit: ThumbsUp,
  "Weak Fit": AlertTriangle,
  "Not Fit": XCircle,
};

export function classificationClass(classification: string): string {
  return CLASSIFICATION_STYLES[classification] || "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export function classificationIcon(classification: string): LucideIcon {
  return CLASSIFICATION_ICONS[classification] || AlertTriangle;
}

export function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

export function scoreGradient(score: number): string {
  if (score >= 75) return "from-emerald-400 to-emerald-600";
  if (score >= 45) return "from-amber-400 to-amber-600";
  return "from-red-400 to-red-600";
}
