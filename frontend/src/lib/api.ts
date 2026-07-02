import type {
  InboxListResponse,
  InboxResume,
  JobDetails,
  ResultsResponse,
  SubmitErrorResponse,
  SubmitResponse,
} from "./types";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and set your n8n webhook URLs.`
    );
  }
  return value;
}

function submitWebhookUrl(): string {
  return requireEnv(
    "NEXT_PUBLIC_N8N_SUBMIT_WEBHOOK_URL",
    process.env.NEXT_PUBLIC_N8N_SUBMIT_WEBHOOK_URL
  );
}

function resultsWebhookUrl(): string {
  return requireEnv(
    "NEXT_PUBLIC_N8N_RESULTS_WEBHOOK_URL",
    process.env.NEXT_PUBLIC_N8N_RESULTS_WEBHOOK_URL
  );
}

function inboxWebhookUrl(): string {
  return requireEnv(
    "NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL",
    process.env.NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL
  );
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error(
      `n8n webhook returned an empty response (HTTP ${response.status}). ` +
        "Check that the workflow is Active and its webhook responds via a " +
        "'Respond to Webhook' node — see docs/SETUP_GUIDE.md troubleshooting."
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`n8n webhook returned non-JSON output: ${text.slice(0, 200)}`);
  }
}

export function generateBatchId(): string {
  return crypto.randomUUID();
}

export function isInboxFeatureEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL);
}

export async function fetchInboxResumes(): Promise<InboxResume[]> {
  const response = await fetch(inboxWebhookUrl(), { method: "GET" });
  const data = await parseJsonResponse<InboxListResponse>(response);

  if (!response.ok) {
    throw new Error("Failed to fetch inbox resumes.");
  }

  return data.resumes;
}

export async function submitBatch(
  batchId: string,
  job: JobDetails,
  files: File[],
  inboxResumeIds: string[] = []
): Promise<SubmitResponse> {
  const formData = new FormData();
  formData.append("batchId", batchId);
  formData.append("jobTitle", job.jobTitle);
  formData.append("jobDescription", job.jobDescription);
  formData.append("mustHaveSkills", job.mustHaveSkills);
  formData.append("niceToHaveSkills", job.niceToHaveSkills);
  formData.append("inboxResumeIds", JSON.stringify(inboxResumeIds));

  // Each file gets its own field name (files0, files1, ...) rather than a shared
  // "files[]" array — the n8n workflow splits resumes by matching binary keys that
  // start with "files", and giving each file a unique key sidesteps ambiguity in
  // how multipart parsers handle repeated field names.
  files.forEach((file, index) => {
    formData.append(`files${index}`, file, file.name);
  });

  const response = await fetch(submitWebhookUrl(), {
    method: "POST",
    body: formData,
  });

  const data = await parseJsonResponse<SubmitResponse | SubmitErrorResponse>(response);

  if (!response.ok) {
    throw new Error((data as SubmitErrorResponse).error || "Failed to submit resumes for screening.");
  }

  return data as SubmitResponse;
}

export async function fetchResults(batchId: string, expected: number): Promise<ResultsResponse> {
  const url = new URL(resultsWebhookUrl());
  url.searchParams.set("batchId", batchId);
  url.searchParams.set("expected", String(expected));

  const response = await fetch(url.toString(), { method: "GET" });
  const data = await parseJsonResponse<ResultsResponse>(response);

  if (!response.ok) {
    throw new Error("Failed to fetch screening results.");
  }

  return data;
}
