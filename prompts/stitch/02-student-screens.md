# Stitch Prompt 02 — Student screen family

Continue the same project and preserve the approved design direction from the anchor screen. Use uploaded Student reference images, especially `batch-list.png`, `batch-detail.png`, `add-application.png`, `application-status.png`, and `application-approved-state.png`.

Create a linked Student flow with these screens:
1. **JAT Batch List**: batch name, start/end dates, total/achieved target where available, Show Detail action, pagination and inactive states.
2. **Batch Detail**: batch name and period; phase cards; multiple date ranges; job-level targets; total and per-range progress; Applied Jobs table.
3. **Add Application**: Date Applied, Role, Company, Location, Position, Job Level, Work System, Year of Experience, Job Vacancy Link, Upload Proof of Application. Indicate required fields. File picker should visually specify JPG/JPEG/PNG only.
4. **Application detail**: submitted field summary, original evidence preview, validation status, feedback/reason when available, and delete confirmation where relevant.
5. **Status variants**: Approved, Rejected, Waiting Confirmation, with distinct but accessible status treatment.
6. **Form error states**: missing required fields, unsupported file type, future date, date outside active range, evidence missing.

Requirements:
- Use the reference images as visual inspiration; do not embed reference images as the resulting screen.
- Make navigation and actions clickable in the Stitch prototype where supported.
- Keep validation status distinct from recruitment-progress status.
- Mock status results must not imply real AI validation.
- For cropped, unreadable, incomplete, irrelevant or uncertain evidence, design messaging that says human review is needed or evidence should be corrected; never imply automatic approval.
- Preserve the existing style as much as possible while improving alignment, responsive behavior and accessibility.

Deliver the Student screens as one coherent family and summarize interactions that are simulated versus intended for real integration.
