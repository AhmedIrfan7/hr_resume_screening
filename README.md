# ResumeIQ — AI-Powered HR Resume Screening

> Upload a job description and a stack of resumes. Get back a ranked, explainable shortlist in seconds.

ResumeIQ automates first-pass resume screening: HR uploads a job description and candidate PDFs through a custom web app, an n8n automation pipeline extracts structured candidate data and scores each resume against the role using OpenAI, and results land in a live ranked dashboard (with the raw data also mirrored to Google Sheets).

## Why this exists

Manual resume screening doesn't scale — a single job posting can pull in hundreds of applications, and every hour spent skimming resumes is an hour not spent interviewing. ResumeIQ turns that into: upload → wait a few seconds → get a ranked, reasoned shortlist.

## How it works (high level)

1. **Frontend** (`frontend/`) — HR fills in the job description + requirements and drags in resume PDFs.
2. **n8n submit workflow** (`workflow/hr-resume-screening-submit.json`) — receives the batch via webhook, extracts text from each PDF, runs a two-stage OpenAI pipeline (structured profile extraction, then rubric-based scoring), and writes results to Google Sheets.
3. **n8n results workflow** (`workflow/hr-resume-screening-results.json`) — the frontend polls this endpoint, which reads back the batch's rows, ranks them, and reports progress.
4. **Frontend** renders the ranked shortlist with score breakdowns, strengths/gaps, and a CSV export.

Full design details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
Setup & deployment: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)
Manual test plan: [`docs/TESTING_CHECKLIST.md`](docs/TESTING_CHECKLIST.md)

## Status

🚧 Actively being built — see commit history for progress. Not yet deployed.

## Tech stack

- **Automation:** n8n (Cloud), OpenAI (GPT-4o-mini), Google Sheets
- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS
- **Deployment target:** Vercel (frontend) + n8n Cloud (automation)

## License

MIT — see [`LICENSE`](LICENSE).
