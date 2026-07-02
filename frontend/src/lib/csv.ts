import type { Candidate } from "./types";

const COLUMNS: { key: keyof Candidate; header: string }[] = [
  { key: "rank", header: "Rank" },
  { key: "candidateName", header: "Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "score", header: "Score" },
  { key: "classification", header: "Fit" },
  { key: "yearsExperience", header: "Years Experience" },
  { key: "skills", header: "Skills" },
  { key: "education", header: "Education" },
  { key: "certifications", header: "Certifications" },
  { key: "strengths", header: "Strengths" },
  { key: "gaps", header: "Gaps" },
  { key: "recommendation", header: "Recommendation" },
  { key: "fileName", header: "Resume File" },
];

// Excel/Sheets treats a leading =, +, -, or @ as the start of a formula (phone
// numbers like "+1-555-..." trigger this). A leading apostrophe forces those
// apps to read the cell as plain text without showing the apostrophe itself.
function escapeCsvValue(value: unknown): string {
  let str = value === undefined || value === null ? "" : String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function candidatesToCsv(candidates: Candidate[]): string {
  const header = COLUMNS.map((c) => escapeCsvValue(c.header)).join(",");
  const rows = candidates.map((candidate) =>
    COLUMNS.map((c) => escapeCsvValue(candidate[c.key])).join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
