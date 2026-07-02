import type { JobDetails } from "@/lib/types";

interface JobDescriptionFormProps {
  value: JobDetails;
  onChange: (value: JobDetails) => void;
}

export function JobDescriptionForm({ value, onChange }: JobDescriptionFormProps) {
  function update<K extends keyof JobDetails>(key: K, next: JobDetails[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Job details</h2>

      <div>
        <label htmlFor="jobTitle" className="mb-1 block text-sm font-medium text-slate-700">
          Job title
        </label>
        <input
          id="jobTitle"
          type="text"
          value={value.jobTitle}
          onChange={(e) => update("jobTitle", e.target.value)}
          placeholder="e.g. Senior Backend Engineer"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="jobDescription" className="mb-1 block text-sm font-medium text-slate-700">
          Job description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="jobDescription"
          required
          value={value.jobDescription}
          onChange={(e) => update("jobDescription", e.target.value)}
          placeholder="Paste the full job description here..."
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mustHaveSkills" className="mb-1 block text-sm font-medium text-slate-700">
            Must-have skills
          </label>
          <input
            id="mustHaveSkills"
            type="text"
            value={value.mustHaveSkills}
            onChange={(e) => update("mustHaveSkills", e.target.value)}
            placeholder="e.g. Python, PostgreSQL, AWS"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="niceToHaveSkills" className="mb-1 block text-sm font-medium text-slate-700">
            Nice-to-have skills
          </label>
          <input
            id="niceToHaveSkills"
            type="text"
            value={value.niceToHaveSkills}
            onChange={(e) => update("niceToHaveSkills", e.target.value)}
            placeholder="e.g. Kubernetes, Kafka"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
}
