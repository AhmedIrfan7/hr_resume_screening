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

5. Add a fourth tab named **`EmailsSent`** with this header row (only needed if you're using the optional candidate email composer — see [section 11](#11-optional-candidate-email-composer)):

   ```
   batchId | fileName | candidateName | to | subject | sentAt
   ```

6. Copy the Sheet ID from the URL — it's the long string between `/d/` and `/edit`:
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
| "From inbox" panel never shows up | `NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL` isn't set — the panel is hidden on purpose until you set it (see [section 10](#10-optional-gmail-inbox-resume-sourcing)) |
| Inbox list is empty even though emails arrived | The Inbox Ingest workflow polls every minute — give it a minute, then check its execution log; also confirm it's **Active**, not just saved |
| "Email Candidate" button never shows up | Both `NEXT_PUBLIC_N8N_EMAIL_ASSISTANT_WEBHOOK_URL` and `NEXT_PUBLIC_N8N_SEND_EMAIL_WEBHOOK_URL` must be set — the button is hidden if either is missing (see [section 11](#11-optional-candidate-email-composer)) |
| Sending an email fails with a permission/scope error | The Gmail credential was likely authorized without send permission (e.g. only used for reading inbox resumes so far) — reconnect it and approve the full scope Google's consent screen asks for |
| `columns.schema is required when columns.mappingMode is defineBelow` in n8n | A Google Sheets append node is missing its schema — this is already fixed in every workflow JSON in this repo; if you hand-edited a node, either re-import fresh or switch that node's mapping mode to **Map Automatically** |

## 10. Optional: Gmail inbox resume sourcing

Lets HR select resumes that arrived as Gmail attachments, alongside (not instead of) drag-and-drop uploads. Skip this whole section if you don't need it — everything else works fine without it.

1. Add the `InboxResumes` tab to your Google Sheet if you haven't already (step 2.4 above).
2. Create (or pick an existing) Google Drive folder to store inbox resume PDFs in. Copy its folder ID from the URL — same trick as the Sheet ID: `https://drive.google.com/drive/folders/`**`THIS_PART_IS_THE_ID`**.
3. In n8n, add credentials:
   - **Gmail OAuth2 API** — connect the Gmail account HR receives resumes at.
   - **Google Drive OAuth2 API** — can reuse the same Google account as your Sheets credential.
4. Import both workflows: [`workflow/hr-resume-screening-inbox-ingest.json`](../workflow/hr-resume-screening-inbox-ingest.json) and [`workflow/hr-resume-screening-inbox-list.json`](../workflow/hr-resume-screening-inbox-list.json).
5. Replace placeholders in **both**:
   - `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` → your Sheet ID.
   - `REPLACE_WITH_YOUR_INBOX_DRIVE_FOLDER_ID` (Inbox Ingest only) → your Drive folder ID from step 2.
   - The `Gmail account` / `Google Drive account` / `Google Sheets account` credential dropdowns → the credentials from step 3.
6. Also update the **submit** workflow: open the `Get Inbox Resumes Sheet` and `Download Inbox Resume` nodes and set their Sheet ID / Google Drive credential the same way (these two nodes exist even if you skip this whole section — they just process zero items when no inbox resumes are selected).
7. **Activate** both new workflows.
8. Open the **Inbox List Webhook** node in the Inbox List workflow, copy its Production URL, and add it to `.env.local` (and Vercel, if deployed):

   ```
   NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL=<inbox list webhook production URL>
   ```

9. Reload the frontend — a "From inbox" panel should now appear next to the job description form once the Inbox Ingest workflow has picked up at least one PDF (it polls every minute; new attachments are skipped if they're not PDFs, silently).

The Gmail trigger deliberately has no search query — it catches every new email, and the `Filter PDF Attachments` code node keeps only PDF attachments. This is intentional: the Gmail API's `filename:` search operator was found to silently drop matching emails in testing, so filtering happens in code instead. If you want to scope it to a specific label or sender, use the **Label Names** or **Sender** fields in the Gmail Trigger node's Filters (not the `q` search field).

## 11. Optional: Candidate email composer

Lets HR compose and send an email to a candidate straight from that candidate's detail view — either typed by hand, or drafted/edited by chatting with an AI assistant that can see the candidate's full screening report and the job description. Nothing is ever sent except by HR clicking the Send button in the frontend. Skip this whole section if you don't need it.

1. Add the `EmailsSent` tab to your Google Sheet if you haven't already (step 2.5 above).
2. Make sure you have a **Gmail OAuth2 API** credential in n8n (the same one from [section 10](#10-optional-gmail-inbox-resume-sourcing) works, provided it has send permission — see the note below).
3. Make sure you have an **OpenAI API** credential (the same one the submit workflow uses works fine).
4. Import both workflows: [`workflow/hr-resume-screening-email-assistant.json`](../workflow/hr-resume-screening-email-assistant.json) and [`workflow/hr-resume-screening-send-email.json`](../workflow/hr-resume-screening-send-email.json).
5. Replace placeholders:
   - **Email Assistant workflow**: `REPLACE_WITH_YOUR_OPENAI_CRED_ID` on the `OpenAI Chat Model` node.
   - **Send Email workflow**: `REPLACE_WITH_YOUR_GMAIL_CRED_ID` on `Send Gmail`, `REPLACE_WITH_YOUR_GOOGLE_SHEET_ID` and the Google Sheets credential on `Log Email to Sheet`.
6. **Activate** both new workflows.
7. Open each workflow's webhook node, copy its Production URL, and add both to `.env.local` (and Vercel, if deployed):

   ```
   NEXT_PUBLIC_N8N_EMAIL_ASSISTANT_WEBHOOK_URL=<email assistant webhook production URL>
   NEXT_PUBLIC_N8N_SEND_EMAIL_WEBHOOK_URL=<send email webhook production URL>
   ```

8. Reload the frontend. Open any candidate's detail view (from the results table) — an **"Email Candidate"** button now appears next to "Back to results".

**About the Gmail send permission:** Gmail OAuth scopes for *reading* mail and *sending* mail are separate. If you set up the Gmail credential purely for inbox resume reading, sending may fail with a permission error the first time you try. If that happens, reconnect the Gmail credential in n8n and make sure you accept the full set of permissions Google's consent screen requests — don't decline any of them.

**Why two separate workflows:** the Email Assistant workflow only ever drafts or edits text and returns it to the frontend — it has no Gmail send node at all, so there's no way a chat request can cause an email to go out. Only the Send Email workflow can actually send, and the frontend only calls it from the explicit Send button.
