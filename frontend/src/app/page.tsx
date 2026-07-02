"use client";

import { useState } from "react";
import type { Candidate, JobDetails } from "@/lib/types";

type ScreeningState = "idle" | "processing" | "results";

interface BatchState {
  batchId: string;
  totalFiles: number;
  processedCount: number;
  candidates: Candidate[];
}

export default function Home() {
  const [state, setState] = useState<ScreeningState>("idle");
  const [job, setJob] = useState<JobDetails | null>(null);
  const [batch, setBatch] = useState<BatchState | null>(null);

  function handleReset() {
    setState("idle");
    setJob(null);
    setBatch(null);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {state === "idle" && (
        <section aria-label="Job details and resume upload">
          <p className="text-slate-500">Upload form goes here.</p>
        </section>
      )}

      {state === "processing" && (
        <section aria-label="Screening in progress">
          <p className="text-slate-500">
            Processing {batch?.processedCount ?? 0} / {batch?.totalFiles ?? 0} resumes...
          </p>
        </section>
      )}

      {state === "results" && (
        <section aria-label="Ranked candidates">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {job?.jobTitle ? `Results for ${job.jobTitle}` : "Results"}
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Start new screening
            </button>
          </div>
          <p className="text-slate-500">Ranked candidate table goes here.</p>
        </section>
      )}
    </main>
  );
}
