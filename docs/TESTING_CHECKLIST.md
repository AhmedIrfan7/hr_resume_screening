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

## Cross-browser / responsive

- [ ] Test in Chrome and at least one other browser (Firefox/Safari/Edge)
- [ ] Resize the browser to a mobile width (~375px) — form, dropzone, and results table remain usable (table scrolls horizontally instead of squashing)
- [ ] Tab through the idle-state form using only the keyboard — every field and the submit button are reachable and show a visible focus ring
- [ ] Open a candidate modal using only the keyboard (Tab to "View", Enter) — focus lands on the modal's close button; Escape closes it and returns focus sensibly

## Sign-off

Once every box above is checked with real n8n + OpenAI + Google Sheets credentials wired up, the system is ready to demo.
