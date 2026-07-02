# Setup Guide

Follow these steps in order — the workflows won't run correctly until the Google Sheet exists, so do that first.

## 1. Prerequisites

- An [n8n Cloud](https://n8n.io/cloud/) account (free trial is enough to test)
- A Google account (for Google Sheets)
- An [OpenAI API key](https://platform.openai.com/api-keys) with access to `gpt-4o-mini`
- Node.js 18.18+ and npm (only needed to run/deploy the frontend)

## 2. Google Sheets setup

1. Create a new Google Sheet. Name it whatever you like (e.g. "ResumeIQ Data").
2. Rename the first tab to **`Candidates`** and add this header row (row 1, exact column names):

   ```
   batchId | fileName | candidateName | email | phone | yearsExperience | skills | education | certifications | summary | score | classification | skillMatchScore | experienceScore | achievementScore | educationScore | clarityScore | strengths | gaps | recommendation | processedAt
   ```

3. Add a second tab named **`Errors`** with this header row:

   ```
   batchId | fileName | errorMessage | occurredAt
   ```

4. Add a third tab named **`InboxResumes`** with this header row (only needed if you're using the optional Gmail inbox sourcing feature — see [section 10](#10-optional-gmail-inbox-resume-sourcing)):

   ```
   id | fileName | senderEmail | senderName | subject | receivedAt | driveFileId
   ```

5. Copy the Sheet ID from the URL — it's the long string between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART_IS_THE_ID`**`/edit`

## 3. n8n Cloud setup & credentials

1. Log into n8n Cloud and create a new workflow (you'll import over it in the next section, so it doesn't matter what you name it here).
2. Go to **Credentials** and add:
   - **OpenAI API** — paste your OpenAI API key.
   - **Google Sheets OAuth2 API** — connect and authorize your Google account (n8n will walk you through Google's OAuth consent screen).

## 4. Importing the two workflows

1. In n8n, go to **Workflows → Import from File** and select [`workflow/hr-resume-screening-submit.json`](../workflow/hr-resume-screening-submit.json).
2. Repeat for [`workflow/hr-resume-screening-results.json`](../workflow/hr-resume-screening-results.json).
3. In **each** workflow, replace the placeholders:
   - `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` → your Sheet ID from step 2.4 (appears in every Google Sheets node).
   - `REPLACE_WITH_YOUR_GOOGLE_CRED_ID` / the `OpenAI account` and `Google Sheets account` credential fields → click each node with a credential dropdown and select the credentials you created in step 3.
   - Run `npm run validate:workflows` from the repo root any time — it'll flag any placeholder you missed.
4. **Activate** both workflows (toggle in the top-right of each workflow editor). They must both be active for the frontend to work.

## 5. Getting the webhook URLs

1. Open the **Submit Webhook** node in the submit workflow → copy the **Production URL** (not the Test URL — the frontend needs the always-on production one).
2. Open the **Results Webhook** node in the results workflow → copy its Production URL the same way.

## 6. Frontend environment configuration

1. `cd frontend`
2. `cp .env.local.example .env.local`
3. Paste the two webhook URLs from step 5 into `.env.local`:

   ```
   NEXT_PUBLIC_N8N_SUBMIT_WEBHOOK_URL=<submit webhook production URL>
   NEXT_PUBLIC_N8N_RESULTS_WEBHOOK_URL=<results webhook production URL>
   ```

## 7. Running the frontend locally

From the repo root:

```
npm run dev:frontend
```

Or directly:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, fill in a job description, upload a couple of PDF resumes, and submit. See [`TESTING_CHECKLIST.md`](TESTING_CHECKLIST.md) for a full test pass.

## 8. Deploying the frontend to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In [Vercel](https://vercel.com/new), import the repo.
3. Set the **Root Directory** to `frontend` (important — the Next.js app lives in the `frontend/` subfolder, not the repo root).
4. Add the two environment variables from step 6 in Vercel's project settings (**Settings → Environment Variables**).
5. Deploy. Vercel will build and give you a live URL.

See [`vercel.json`](../frontend/vercel.json) for build settings pinned in the repo.

## 9. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Frontend shows "Missing NEXT_PUBLIC_N8N_..." error | `.env.local` not set (local) or env vars not set in Vercel (deployed) |
| Submit request fails with CORS error | n8n webhook needs to allow your frontend's origin — n8n Cloud allows all origins by default; double check the workflow is **active**, not just saved |
| Results never complete (stuck at 0 / N) | Workflow may have failed before writing to the sheet — check the `Errors` tab in your Google Sheet, and check the n8n execution log for the submit workflow |
| "Only PDF resumes are supported" for a real PDF | Some scanners/exports mislabel the MIME type — try re-saving the PDF from a browser's print-to-PDF |
| Google Sheets node errors in n8n | Re-check the Sheet ID and that the tab names are exactly `Candidates` and `Errors` (case-sensitive) |
