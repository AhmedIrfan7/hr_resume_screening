"use client";

import { useEffect, useState } from "react";
import { JobDescriptionForm } from "@/components/screening/JobDescriptionForm";
import { ProcessingView } from "@/components/screening/ProcessingView";
import { ResumeDropzone } from "@/components/screening/ResumeDropzone";
import { usePollResults } from "@/hooks/usePollResults";
import { generateBatchId, submitBatch } from "@/lib/api";
import type { JobDetails } from "@/lib/types";

type ScreeningState = "idle" | "processing" | "results";

interface BatchState {
  batchId: string;
  totalFiles: number;
}

const EMPTY_JOB: JobDetails = {
  jobTitle: "",
  jobDescription: "",
  mustHaveSkills: "",
  niceToHaveSkills: "",
};

export default function Home() {
  const [state, setState] = useState<ScreeningState>("idle");
  const [job, setJob] = useState<JobDetails>(EMPTY_JOB);
  const [files, setFiles] = useState<File[]>([]);
  const [batch, setBatch] = useState<BatchState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = job.jobDescription.trim().length > 0 && files.length > 0 && !isSubmitting;

  const poll = usePollResults(batch?.batchId ?? null, batch?.totalFiles ?? 0, state === "processing");

  useEffect(() => {
    if (state === "processing" && poll.isComplete) {
      setState("results");
    }
  }, [state, poll.isComplete]);

  function handleReset() {
    setState("idle");
    setJob(EMPTY_JOB);
    setFiles([]);
    setBatch(null);
    setSubmitError(null);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const batchId = generateBatchId();
      const response = await submitBatch(batchId, job, files);
      setBatch({ batchId: response.batchId, totalFiles: response.totalFiles });
      setState("processing");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {state === "idle" && (
        <section aria-label="Job details and resume upload" className="space-y-6">
          <JobDescriptionForm value={job} onChange={setJob} />
          <ResumeDropzone files={files} onChange={setFiles} />

          {submitError && (
            <p role="alert" className="text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Submitting..." : "Start screening"}
          </button>
        </section>
      )}

      {state === "processing" && batch && (
        <section aria-label="Screening in progress" className="space-y-4">
          <ProcessingView
            processedCount={poll.processedCount}
            totalFiles={batch.totalFiles}
            timedOut={poll.timedOut}
          />
          {poll.timedOut && (
            <button
              type="button"
              onClick={() => setState("results")}
              className="mx-auto block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View partial results ({poll.processedCount} ready)
            </button>
          )}
        </section>
      )}

      {state === "results" && (
        <section aria-label="Ranked candidates">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {job.jobTitle ? `Results for ${job.jobTitle}` : "Results"}
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
