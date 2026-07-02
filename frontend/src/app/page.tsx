"use client";

import {
  AlertCircle,
  ArrowRight,
  Download,
  Inbox,
  Loader2,
  RotateCcw,
  SearchX,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/screening/Hero";
import { InboxResumeList } from "@/components/screening/InboxResumeList";
import { JobDescriptionForm } from "@/components/screening/JobDescriptionForm";
import { CandidateDetailModal } from "@/components/screening/CandidateDetailModal";
import { CandidateFilters } from "@/components/screening/CandidateFilters";
import { ProcessingView } from "@/components/screening/ProcessingView";
import { RankedCandidateTable } from "@/components/screening/RankedCandidateTable";
import { ResumeDropzone } from "@/components/screening/ResumeDropzone";
import { usePollResults } from "@/hooks/usePollResults";
import { generateBatchId, isInboxFeatureEnabled, submitBatch } from "@/lib/api";
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
  const [selectedInboxIds, setSelectedInboxIds] = useState<string[]>([]);
  const [batch, setBatch] = useState<BatchState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("All");

  const canSubmit =
    job.jobDescription.trim().length > 0 &&
    files.length + selectedInboxIds.length > 0 &&
    !isSubmitting;

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
    setSelectedInboxIds([]);
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
      const response = await submitBatch(batchId, job, files, selectedInboxIds);
      setBatch({ batchId: response.batchId, totalFiles: response.totalFiles });
      setState("processing");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inboxEnabled = isInboxFeatureEnabled();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {state === "idle" && (
        <section aria-label="Job details and resume upload" className="space-y-6">
          <Hero />
          <div className={`grid gap-6 ${inboxEnabled ? "lg:grid-cols-3" : ""}`}>
            <div className={`space-y-6 ${inboxEnabled ? "lg:col-span-2" : ""}`}>
              <JobDescriptionForm value={job} onChange={setJob} />
              <ResumeDropzone files={files} onChange={setFiles} />

              {submitError && (
                <p
                  role="alert"
                  className="flex animate-fade-in items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  {submitError}
                </p>
              )}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Start screening
                    {files.length + selectedInboxIds.length > 0 &&
                      ` (${files.length + selectedInboxIds.length} resume${
                        files.length + selectedInboxIds.length === 1 ? "" : "s"
                      })`}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </button>

              {!canSubmit && !isSubmitting && (
                <p className="text-center text-xs text-slate-400">
                  {job.jobDescription.trim().length === 0
                    ? "Add a job description to continue."
                    : files.length + selectedInboxIds.length === 0
                      ? "Select at least one resume — upload a PDF or pick from the inbox."
                      : ""}
                </p>
              )}
            </div>

            {inboxEnabled && (
              <div>
                <InboxResumeList selectedIds={selectedInboxIds} onChange={setSelectedInboxIds} />
              </div>
            )}
          </div>
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
            <p
              role="alert"
              className="mx-auto flex max-w-md animate-fade-in items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-center text-sm text-amber-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {poll.error} Retrying automatically...
            </p>
          )}
          {poll.timedOut && (
            <button
              type="button"
              onClick={() => setState("results")}
              className="mx-auto block rounded text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              View partial results ({poll.processedCount} ready)
            </button>
          )}
        </section>
      )}

      {state === "results" && (
        <section aria-label="Ranked candidates" className="animate-fade-in-up">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <Trophy className="h-4 w-4" strokeWidth={2.25} />
              </span>
              {job.jobTitle ? `Results for ${job.jobTitle}` : "Results"}
            </h2>
            <div className="flex items-center gap-2">
              {filteredCandidates.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Export CSV
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.25} />
                New screening
              </button>
            </div>
          </div>
          {poll.error && (
            <p
              role="alert"
              className="mb-4 flex animate-fade-in items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
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
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center animate-fade-in">
                  <SearchX className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm text-slate-500">No candidates match your search or filter.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Inbox className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">
                {poll.timedOut
                  ? "No candidates finished processing. Check the Errors sheet — resumes may have failed extraction or scoring."
                  : "No candidates processed yet."}
              </p>
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
