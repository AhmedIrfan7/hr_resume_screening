# ResumeIQ: AI-Powered HR Resume Screening

> Upload a job description and a stack of resumes. Get back a ranked, explainable shortlist in seconds, then draft and send candidate emails with an AI assistant, all without leaving the app.

**Live demo:** https://resume-iq-by-ahmed-irfan.vercel.app/

ResumeIQ automates first-pass resume screening end to end. HR enters a job description and candidate PDFs through a custom web app, an n8n automation pipeline extracts structured candidate data and scores each resume against the role using OpenAI, and results land in a live ranked dashboard. Resumes that arrive as Gmail attachments are picked up automatically. From a candidate's report, HR can draft and send a personalized email with the help of an AI assistant, with a strict rule that nothing sends until HR clicks Send.

<!-- Screenshot / demo GIF of the ranked results table goes here. -->

## Why this exists

Manual resume screening does not scale. A single job posting can pull in hundreds of applications, and every hour spent skimming resumes is an hour not spent interviewing. ResumeIQ turns that into: enter a job, add resumes, get a ranked and reasoned shortlist, then reach out to candidates directly, all in one place.

## Features

**Core screening**
- Custom branded frontend, not an n8n form or a default template
- Two-stage AI pipeline: one OpenAI call extracts a structured candidate profile, a second scores it against the job with a weighted rubric (Skills 30, Experience 25, Achievements 20, Education 10, Clarity 15)
- Explainable scoring: every candidate gets a category breakdown, strengths, gaps, and a written recommendation, not just a bare number
- Resilient batch processing: one bad or unreadable resume never blocks the rest of the batch; failures are logged separately, not silently dropped
- Live progress with a processed/total counter and a graceful "still processing" fallback
- Search, filter, and CSV export on the results table

**Gmail inbox resume sourcing (optional)**
- Watches HR's Gmail inbox for new emails with PDF attachments and lists them as selectable resumes
- HR can mix inbox-sourced resumes with drag-and-drop uploads in the same batch
- Sourced resumes stay available for reuse across future job postings

**AI-assisted email composer (optional)**
- Compose and send a candidate email straight from that candidate's report
- Chat with an AI assistant that sees the candidate's full report and the job description to draft or edit the email, or write it by hand
- Quick-action presets: interview invite, rejection, request more info, more formal, shorten it
- Nothing is ever sent automatically; only clicking Send delivers the email
- Every sent email is logged for an audit trail

## How it works (high level)

1. **Frontend** (`frontend/`): HR fills in the job description and requirements, then drags in resume PDFs and/or selects resumes already sourced from email.
2. **Submit workflow** (`workflow/hr-resume-screening-submit.json`): receives the batch via webhook, merges uploaded files with any selected inbox resumes, extracts text from each PDF, runs the two-stage OpenAI pipeline, and writes results to Google Sheets.
3. **Results workflow** (`workflow/hr-resume-screening-results.json`): the frontend polls this endpoint, which reads back the batch's rows, ranks them, and reports progress.
4. **Inbox Ingest workflow** (`workflow/hr-resume-screening-inbox-ingest.json`): polls Gmail, uploads any PDF attachment to Google Drive, and logs it for selection.
5. **Inbox List workflow** (`workflow/hr-resume-screening-inbox-list.json`): serves the list of inbox-sourced resumes to the frontend.
6. **Email Assistant workflow** (`workflow/hr-resume-screening-email-assistant.json`): drafts or edits a candidate email with AI, grounded in that candidate's report; it can only return text, never send anything.
7. **Send Email workflow** (`workflow/hr-resume-screening-send-email.json`): the only workflow able to send an email, triggered only when HR clicks Send, and logs every send.

Full design details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Project structure

```
hr_resume_screening/
├── workflow/           n8n workflow exports, import directly into n8n
│   ├── hr-resume-screening-submit.json
│   ├── hr-resume-screening-results.json
│   ├── hr-resume-screening-inbox-ingest.json
│   ├── hr-resume-screening-inbox-list.json
│   ├── hr-resume-screening-email-assistant.json
│   └── hr-resume-screening-send-email.json
├── frontend/           Next.js app (the HR-facing UI)
├── scripts/            validate-workflows.js, structural JSON validator, no external calls
├── sample-data/        synthetic test resume and PII policy for local testing
└── docs/
    ├── ARCHITECTURE.md      full system design and rationale
    ├── SETUP_GUIDE.md       step-by-step: Google Sheets, n8n, frontend, Vercel
    └── TESTING_CHECKLIST.md manual end-to-end test plan
```

## Quick start

1. Follow [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) to create the Google Sheet, import the n8n workflows, and wire up credentials. The inbox sourcing and email composer sections are optional; core screening works without them.
2. `cd frontend && cp .env.local.example .env.local` and fill in your webhook URLs.
3. `npm run dev:frontend` from the repo root (or `cd frontend && npm install && npm run dev`).
4. Open http://localhost:3000 and run through [`docs/TESTING_CHECKLIST.md`](docs/TESTING_CHECKLIST.md).

## Validation

- `npm run validate:workflows`: checks every n8n workflow JSON file for valid structure (no dangling connections, no duplicate node ids, recognized node types) without needing a running n8n instance.
- `npm run build:frontend`: full Next.js production build (type-checking and linting included).

## Deployment

- **Frontend:** deployed to Vercel with **Root Directory** set to `frontend`. Build settings are pinned in [`frontend/vercel.json`](frontend/vercel.json). Requires the `NEXT_PUBLIC_N8N_*_WEBHOOK_URL` variables listed in `.env.local.example` as environment variables. Live at https://resume-iq-by-ahmed-irfan.vercel.app/
- **Automation:** import the files in `workflow/` into n8n Cloud, wire up OpenAI, Google Sheets, Google Drive, and Gmail credentials, and activate each workflow.

Full walkthrough: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md).

## Known limitations (v1, by design)

- PDF resumes only (no DOCX): see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#known-limitations-by-design-for-v1) for the full rationale
- No authentication: webhook URLs are the security boundary, suitable for an internal tool behind a shared link
- Google Sheets as the datastore: zero setup cost, human-inspectable, trades off concurrency headroom against a real database
- Email composer works one candidate at a time by design, not bulk send, to keep the blast radius of sending real email small

## Tech stack

- **Automation:** n8n (Cloud), OpenAI (GPT-4o-mini)
- **Data and integrations:** Google Sheets, Google Drive, Gmail API
- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS
- **Deployment:** Vercel (frontend) and n8n Cloud (automation)

## License

MIT: see [`LICENSE`](LICENSE).
