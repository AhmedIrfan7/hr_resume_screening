"use client";

import { useEffect, useMemo, useState } from "react";
import { JobDescriptionForm } from "@/components/screening/JobDescriptionForm";
import { CandidateDetailModal } from "@/components/screening/CandidateDetailModal";
import { CandidateFilters } from "@/components/screening/CandidateFilters";
import { ProcessingView } from "@/components/screening/ProcessingView";
import { RankedCandidateTable } from "@/components/screening/RankedCandidateTable";
import { ResumeDropzone } from "@/components/screening/ResumeDropzone";
import { usePollResults } from "@/hooks/usePollResults";
import { generateBatchId, submitBatch } from "@/lib/api";
import { candidatesToCsv, downloadCsv } from "@/lib/csv";
import type { Candidate, JobDetails } from "@/lib/types";

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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("All");

  const canSubmit = job.jobDescription.trim().length > 0 && files.length > 0 && !isSubmitting;

  const poll = usePollResults(batch?.batchId ?? null, batch?.totalFiles ?? 0, state === "processing");

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return poll.candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.candidateName.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query);
      const matchesClassification =
        classificationFilter === "All" || candidate.classification === classificationFilter;
      return matchesSearch && matchesClassification;
    });
  }, [poll.candidates, search, classificationFilter]);

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
    setSelectedCandidate(null);
  }

  function handleExportCsv() {
    const csv = candidatesToCsv(filteredCandidates);
    const safeTitle = (job.jobTitle || "resumeiq-results").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadCsv(`${safeTitle}.csv`, csv);
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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
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
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
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
          {poll.error && (
            <p role="alert" className="text-center text-sm text-amber-600">
              {poll.error} Retrying automatically...
            </p>
          )}
          {poll.timedOut && (
            <button
              type="button"
              onClick={() => setState("results")}
              className="mx-auto block rounded text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              View partial results ({poll.processedCount} ready)
            </button>
          )}
        </section>
      )}

      {state === "results" && (
        <section aria-label="Ranked candidates">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {job.jobTitle ? `Results for ${job.jobTitle}` : "Results"}
            </h2>
            <div className="flex items-center gap-4">
              {filteredCandidates.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="rounded text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Export CSV
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="rounded text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Start new screening
              </button>
            </div>
          </div>
          {poll.error && (
            <p role="alert" className="mb-4 text-sm text-amber-600">
              {poll.error}
            </p>
          )}

          {poll.candidates.length > 0 ? (
            <>
              <CandidateFilters
                search={search}
                onSearchChange={setSearch}
                classification={classificationFilter}
                onClassificationChange={setClassificationFilter}
                resultCount={filteredCandidates.length}
              />
              {filteredCandidates.length > 0 ? (
                <RankedCandidateTable candidates={filteredCandidates} onSelect={setSelectedCandidate} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                  No candidates match your search or filter.
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              {poll.timedOut
                ? "No candidates finished processing. Check the Errors sheet — resumes may have failed extraction or scoring."
                : "No candidates processed yet."}
            </div>
          )}

          {selectedCandidate && (
            <CandidateDetailModal
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
            />
          )}
        </section>
      )}
    </main>
  );
}
