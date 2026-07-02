# ResumeIQ — AI-Powered HR Resume Screening

> Upload a job description and a stack of resumes. Get back a ranked, explainable shortlist in seconds.

ResumeIQ automates first-pass resume screening: HR uploads a job description and candidate PDFs through a custom web app, an n8n automation pipeline extracts structured candidate data and scores each resume against the role using OpenAI, and results land in a live ranked dashboard (with the raw data also mirrored to Google Sheets).

<!-- Screenshot / demo GIF of the upload form and ranked results table goes here once deployed. -->

## Why this exists

Manual resume screening doesn't scale — a single job posting can pull in hundreds of applications, and every hour spent skimming resumes is an hour not spent interviewing. ResumeIQ turns that into: upload → wait a few seconds → get a ranked, reasoned shortlist.

## Features

- **Custom branded frontend** — not an n8n form or a default template; a purpose-built Next.js app
- **Two-stage AI pipeline** — separate OpenAI calls for structured profile extraction and rubric-based scoring, for better accuracy than one combined prompt
- **Explainable scoring** — every candidate gets a category breakdown (skills, experience, achievements, education, clarity), strengths, gaps, and a written recommendation, not just a bare number
- **Resilient batch processing** — one bad or unreadable resume never blocks the rest of the batch; failures are logged separately, not silently dropped
- **Live progress + graceful degradation** — real-time processed/total counter, with a "still processing" fallback and manual partial-results view if the AI is slow
- **Search, filter, and CSV export** on the results table
- **Fully documented and structurally validated** — see [Validation](#validation) below

## How it works (high level)

1. **Frontend** (`frontend/`) — HR fills in the job description + requirements and drags in resume PDFs.
2. **n8n submit workflow** (`workflow/hr-resume-screening-submit.json`) — receives the batch via webhook, extracts text from each PDF, runs a two-stage OpenAI pipeline (structured profile extraction, then rubric-based scoring), and writes results to Google Sheets.
3. **n8n results workflow** (`workflow/hr-resume-screening-results.json`) — the frontend polls this endpoint, which reads back the batch's rows, ranks them, and reports progress.
4. **Frontend** renders the ranked shortlist with score breakdowns, strengths/gaps, and a CSV export.

Full design details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Project structure

```
hr_resume_screening/
├── workflow/           n8n workflow exports (submit + results, import directly into n8n)
├── frontend/           Next.js app (the HR-facing UI)
├── scripts/            validate-workflows.js — structural JSON validator, no external calls
├── sample-data/        synthetic test resume + PII policy for local testing
└── docs/
    ├── ARCHITECTURE.md      full system design and rationale
    ├── SETUP_GUIDE.md       step-by-step: Google Sheets → n8n → frontend → Vercel
    └── TESTING_CHECKLIST.md manual end-to-end test plan
```

## Quick start

1. Follow [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) to create the Google Sheet, import both n8n workflows, and wire up credentials.
2. `cd frontend && cp .env.local.example .env.local` and fill in your two webhook URLs.
3. `npm run dev:frontend` from the repo root (or `cd frontend && npm install && npm run dev`).
4. Open http://localhost:3000 and run through [`docs/TESTING_CHECKLIST.md`](docs/TESTING_CHECKLIST.md).

## Validation

- `npm run validate:workflows` — checks both n8n workflow JSON files for valid structure (no dangling connections, no duplicate node ids, recognized node types) without needing a running n8n instance.
- `npm run build:frontend` — full Next.js production build (type-checking + linting included).

## Deployment

- **Frontend:** deploy `frontend/` to Vercel with **Root Directory** set to `frontend`. Build settings are pinned in [`frontend/vercel.json`](frontend/vercel.json). Requires `NEXT_PUBLIC_N8N_SUBMIT_WEBHOOK_URL` and `NEXT_PUBLIC_N8N_RESULTS_WEBHOOK_URL` set as environment variables.
- **Automation:** import both files in `workflow/` into n8n Cloud, wire up OpenAI + Google Sheets credentials, activate both workflows.

Full walkthrough: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md).

## Known limitations (v1, by design)

- PDF resumes only (no DOCX) — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#known-limitations-by-design-for-v1) for the full rationale
- No authentication — webhook URLs are the security boundary, suitable for an internal tool behind a shared link
- Google Sheets as the datastore — zero setup cost, human-inspectable, trades off concurrency headroom vs. a real database

## Tech stack

- **Automation:** n8n (Cloud), OpenAI (GPT-4o-mini), Google Sheets
- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS
- **Deployment target:** Vercel (frontend) + n8n Cloud (automation)

## License

MIT — see [`LICENSE`](LICENSE).
