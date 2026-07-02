# Sample data

For testing the submit workflow you need real PDF resumes. **Do not commit real resumes here** — they contain PII (names, emails, phone numbers) and this repo is public.

- `.gitignore` already blocks `sample-data/*.pdf`, `sample-data/*.docx`, and anything named `real-*` in this folder.
- Drop your own test PDFs here locally (e.g. your own resume) — they'll stay untracked.
- `sample-resume-synthetic.txt` is a fake candidate profile (no real person) kept in the repo for reference/documentation purposes only — it is not a valid PDF and can't be uploaded through the frontend as-is, it just documents the kind of content the extraction prompt is designed to handle.

See [`docs/TESTING_CHECKLIST.md`](../docs/TESTING_CHECKLIST.md) for the manual end-to-end test plan.
