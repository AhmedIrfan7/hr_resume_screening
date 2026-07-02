# Architecture

## Overview

ResumeIQ is three loosely-coupled pieces talking over HTTP:

```
┌─────────────────┐        multipart POST         ┌──────────────────────────┐
│  Next.js         │ ─────────────────────────────▶│ n8n: submit workflow      │
│  frontend        │                                │ (webhook, async)          │
│                  │        poll GET (batchId)      │                            │
│                  │ ◀─────────────────────────────▶│ n8n: results workflow     │
└─────────┬────────┘                                └──────────┬────────────────┘
          │                                                     │
          │                                                     ▼
          │                                          ┌──────────────────────┐
          │                                          │ Google Sheets          │
          │                                          │ (Candidates, Errors)   │
          │                                          └──────────┬────────────┘
          │                                                     │
          │                                          ┌──────────▼────────────┐
          └─────────────────────────────────────────▶│ OpenAI (extraction +   │
                                (indirectly, via n8n) │ scoring)               │
                                                       └────────────────────────┘
```

No custom backend server — the frontend talks directly to two n8n webhooks. n8n owns all AI calls, PDF parsing, and persistence.

## Why webhook-driven instead of folder/form polling

The alternative (Google Drive folder watch, Google Forms + schedule trigger) is simpler to wire but feels invisible to the end user — HR drops a file and has no idea when/if it's done. A webhook-driven custom frontend gives immediate feedback (upload → live progress → ranked results), which matters both for actual usability and for demoing the product. The tradeoff is more moving parts (CORS, polling, timeout handling) — accepted deliberately.

## Data flow — submit path

1. **Frontend** builds a client-side `batchId` (UUID v4) so multiple concurrent screenings never collide, and POSTs `multipart/form-data`: `batchId`, `jobTitle`, `jobDescription`, `mustHaveSkills`, `niceToHaveSkills`, `files[]` (PDF only).
2. **Webhook Trigger** node receives the request. Configured to **respond immediately** so the frontend isn't blocked waiting for N resumes × 2 AI calls each — that could easily exceed typical HTTP timeouts.
3. A validation step rejects the batch early (missing job description, zero files, non-PDF mime type) before any AI spend happens.
4. **Split Out** turns the files array into one item per resume, so each resume is processed independently — a bad PDF in file #3 doesn't stop files #1, #2, #4...
5. **Extract From File** (PDF mode) pulls raw text. `onError: continueRegularOutput` — extraction failures route to the Errors sheet instead of crashing the batch.
6. **Stage 1 — profile extraction** (OpenAI `Information Extractor`): converts messy resume text into a structured JSON profile (name, email, phone, years experience, skills, education, certifications, summary). Kept separate from scoring so the extraction prompt can stay narrowly focused (better accuracy than one mega-prompt doing both jobs).
7. **Stage 2 — scoring** (OpenAI `Information Extractor`): takes the structured profile + the job description and produces a weighted score (0-100) with a category breakdown, strengths, gaps, and a recommendation band. The rubric:
   - Skills Match — 30 pts
   - Experience Relevance — 25 pts
   - Achievements / Impact — 20 pts
   - Education / Certifications — 10 pts
   - Resume Clarity — 15 pts
8. Results are merged with batch metadata (`batchId`, `fileName`, `processedAt`) and appended as one row to the `Candidates` Google Sheet tab.
9. Any failure along the way (extraction, AI call, malformed AI response) is caught and logged to the `Errors` tab with the batch/file it belongs to — visible for debugging without needing n8n execution logs.

## Data flow — results path

The frontend polls a second, independent webhook every ~2.5s:

1. **Webhook Trigger** (GET) reads `batchId` and `expected` (total file count, known client-side from the original submission) from the query string.
2. **Google Sheets — Get Rows** filtered by `batchId`.
3. A **Code** node sorts by `score` descending, assigns `rank`, and computes `processedCount` vs `expected` to report progress and an `isComplete` flag.
4. Response is JSON: `{ batchId, processedCount, expected, isComplete, candidates: [...] }`.

The frontend stops polling once `isComplete` is true or after a 90-second timeout (shown as a "still processing" fallback rather than an error — AI calls can occasionally be slow, this shouldn't look like a crash).

## Why two separate n8n workflows instead of one

Submit and results-query have very different failure modes and timing (submit is a slow, multi-step, side-effecting pipeline; results is a fast, read-only, frequently-polled lookup). Splitting them means a bug or slowdown in one never blocks the other, and each can be tested/debugged independently. This mirrors a pattern from an earlier hiring-automation project on this machine that used a similar ingest/notify split.

## Known limitations (by design, for v1)

- **PDF only.** DOCX resumes are rejected client-side with a clear message. n8n's built-in file extraction handles PDF cleanly; DOCX would need an extra conversion step that adds fragility for limited benefit in a first version.
- **No auth.** The webhook URLs are treated as the security boundary (unlisted, not indexed). Fine for an internal HR tool behind a shared link; would need real auth before public exposure.
- **Google Sheets as the datastore.** Chosen deliberately for this version — zero setup cost, and a hiring manager can open the raw sheet directly to sanity-check the AI's scoring. Trades off query performance/concurrency headroom a real database would give.
- **Polling, not websockets/SSE.** Simpler to implement against n8n webhooks and completely adequate for typical batch sizes (a handful to a few dozen resumes).
