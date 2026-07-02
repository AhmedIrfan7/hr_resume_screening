import { Briefcase, ListChecks, Sparkles } from "lucide-react";
import type { JobDetails } from "@/lib/types";

interface JobDescriptionFormProps {
  value: JobDetails;
  onChange: (value: JobDetails) => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:shadow-glow";

export function JobDescriptionForm({ value, onChange }: JobDescriptionFormProps) {
  function update<K extends keyof JobDetails>(key: K, next: JobDetails[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="animate-fade-in-up space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Briefcase className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <h2 className="text-base font-semibold text-slate-900">Job details</h2>
      </div>

      <div>
        <label htmlFor="jobTitle" className="mb-1.5 block text-sm font-medium text-slate-700">
          Job title
        </label>
        <input
          id="jobTitle"
          type="text"
          value={value.jobTitle}
          onChange={(e) => update("jobTitle", e.target.value)}
          placeholder="e.g. Senior Backend Engineer"
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700">
            Job description <span className="text-brand-600">*</span>
          </label>
          <span className="text-xs tabular-nums text-slate-400">
            {value.jobDescription.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          id="jobDescription"
          required
          value={value.jobDescription}
          onChange={(e) => update("jobDescription", e.target.value)}
          placeholder="Paste the full job description here..."
          rows={6}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="mustHaveSkills"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
          >
            <ListChecks className="h-3.5 w-3.5 text-slate-400" />
            Must-have skills
          </label>
          <input
            id="mustHaveSkills"
            type="text"
            value={value.mustHaveSkills}
            onChange={(e) => update("mustHaveSkills", e.target.value)}
            placeholder="e.g. Python, PostgreSQL, AWS"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="niceToHaveSkills"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            Nice-to-have skills
          </label>
          <input
            id="niceToHaveSkills"
            type="text"
            value={value.niceToHaveSkills}
            onChange={(e) => update("niceToHaveSkills", e.target.value)}
            placeholder="e.g. Kubernetes, Kafka"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
