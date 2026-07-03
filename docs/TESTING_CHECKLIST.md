# Testing Checklist

Manual end-to-end test plan. Run this once after completing [`SETUP_GUIDE.md`](SETUP_GUIDE.md) — it can't be automated from outside a live n8n instance, so it's a checklist, not a script.

Use `sample-data/sample-resume-synthetic.txt` as a reference for what a good test resume should contain (copy its content into a real PDF, or use your own resume — see [`sample-data/README.md`](../sample-data/README.md) for why real resumes aren't committed to the repo).

## Golden path

- [ ] Open the deployed (or local) frontend — the ResumeIQ header and job form load with no console errors
- [ ] Fill in a job title, a real job description (a few paragraphs), and 2-3 must-have skills
- [ ] Drag-and-drop 2-3 PDF resumes onto the dropzone — they appear in the file list
- [ ] Click "Start screening" — button shows "Submitting...", then the view switches to the processing screen within a couple seconds
- [ ] Processing screen shows a live "X / N resumes processed" counter that increases over time
- [ ] Within ~30-60s (depends on OpenAI response time × 2 files), the view auto-switches to the results screen
- [ ] Results table shows all submitted resumes, ranked by score descending, with fit badges (Strong Fit / Fit / Weak Fit / Not Fit)
- [ ] Click "View" on a candidate — modal opens with full profile, category score breakdown bars, strengths, gaps, and a recommendation
- [ ] Press `Escape` — modal closes
- [ ] Type a candidate's name into the search box — table filters to matching rows only
- [ ] Change the fit filter dropdown — table filters accordingly
- [ ] Click "Export CSV" — a CSV file downloads and opens correctly with all visible columns
- [ ] Click "Start new screening" — form resets to empty, ready for another batch
- [ ] Open the Google Sheet `Candidates` tab — rows for this batch are present with correct `batchId` and all fields populated

## Validation & error paths

- [ ] Try submitting with no job description — "Start screening" button stays disabled
- [ ] Try submitting with zero files — button stays disabled
- [ ] Try uploading a non-PDF file (e.g. `.docx`) — it's rejected client-side with a visible message, not silently dropped
- [ ] Try uploading a file over 5MB — rejected client-side with a visible message
- [ ] Try uploading 16+ files in one batch — batch is capped at 15 with a visible message
- [ ] Submit a batch where one resume is corrupted or password-protected — that resume fails gracefully (logged to the `Errors` sheet tab), the other resumes in the batch still complete and appear in results
- [ ] Turn off wifi briefly during polling, then reconnect — an amber "retrying automatically" message appears during the outage and results resume once connectivity returns (no crash, no stuck spinner)

## Inbox resume sourcing (optional feature)

Skip this section entirely if you haven't set up [section 10 of SETUP_GUIDE.md](SETUP_GUIDE.md#10-optional-gmail-inbox-resume-sourcing).

- [ ] Email a PDF resume as an attachment to the Gmail inbox the Inbox Ingest workflow watches
- [ ] Within ~1 minute, the n8n execution log shows the Inbox Ingest workflow ran and the PDF appears in the `InboxResumes` sheet tab with sender/subject/filename populated
- [ ] Reload the ResumeIQ frontend — a "From inbox" panel appears next to the job description form, showing that resume with sender name, subject, and a relative timestamp (e.g. "5m ago")
- [ ] Check the checkbox next to it — a "1 selected" badge appears, and "Start screening" becomes enabled even with zero drag-and-dropped files
- [ ] Select that inbox resume AND drag-drop 1-2 more PDFs in the same batch, then submit — results include candidates from both sources, all scored consistently
- [ ] Open the Google Sheet `Candidates` tab — the inbox-sourced row has the correct `fileName` and full extracted/scored data, same as an uploaded one
- [ ] Run a second screening later and re-select the same inbox resume — it's still selectable (list doesn't remove items after use) and produces a fresh, independent result row
- [ ] With `NEXT_PUBLIC_N8N_INBOX_WEBHOOK_URL` unset (or the Inbox List workflow inactive), reload the frontend — no "From inbox" panel, no console errors, drag-and-drop upload still works normally

## Candidate email composer (optional feature)

Skip this section entirely if you haven't set up [section 11 of SETUP_GUIDE.md](SETUP_GUIDE.md#11-optional-candidate-email-composer).

- [ ] Open a candidate's detail view from the results table — an "Email Candidate" button appears next to "Back to results"
- [ ] Click it — the composer opens with **To** pre-filled from the candidate's extracted email, **Subject** and **Message** empty, and an AI assistant chat panel on the right
- [ ] Type your own subject and message by hand, without touching the AI panel — the **Send** button enables once all three fields are non-empty
- [ ] Click a quick-action preset (e.g. "Interview invite") without typing anything into chat — a user message bubble appears, then an assistant reply, and the Subject/Message fields update with a real draft grounded in that candidate's actual score/strengths/gaps
- [ ] Type a custom follow-up instruction in the chat input (e.g. "make it shorter") and press Enter — the draft updates again and a new assistant message appears; scroll position stays pinned to the latest message
- [ ] Manually edit the AI-drafted Subject or Message text directly in the fields — edits stick and are NOT overwritten unless you ask the assistant for another change
- [ ] Confirm no email has been sent yet at this point — nothing should appear in the `EmailsSent` sheet tab or the candidate's actual inbox
- [ ] Click **Send Email** — button shows "Sending...", then a green "Email sent to ..." confirmation appears
- [ ] Check the real inbox at the "To" address — the email arrived with the exact subject/body shown in the composer
- [ ] Open the Google Sheet `EmailsSent` tab — a new row appears with the correct `batchId`, `fileName`, `candidateName`, `to`, `subject`, and `sentAt`
- [ ] Try sending with an invalid "To" address (e.g. delete the `@`) — Send stays disabled or the request is rejected with a clear error, no email goes out
- [ ] With `NEXT_PUBLIC_N8N_EMAIL_ASSISTANT_WEBHOOK_URL` or `NEXT_PUBLIC_N8N_SEND_EMAIL_WEBHOOK_URL` unset, reload the frontend — no "Email Candidate" button appears anywhere, no console errors

## Cross-browser / responsive

- [ ] Test in Chrome and at least one other browser (Firefox/Safari/Edge)
- [ ] Resize the browser to a mobile width (~375px) — form, dropzone, and results table remain usable (table scrolls horizontally instead of squashing)
- [ ] Tab through the idle-state form using only the keyboard — every field and the submit button are reachable and show a visible focus ring
- [ ] Open a candidate modal using only the keyboard (Tab to "View", Enter) — focus lands on the modal's close button; Escape closes it and returns focus sensibly

## Sign-off

Once every box above is checked with real n8n + OpenAI + Google Sheets credentials wired up, the system is ready to demo.
