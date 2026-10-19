# Stitch Prompt 03 — Admin/Talent Support screen family

Continue the approved project visual language. Use the uploaded Admin reference images: `batch-management.png`, `batch-create.png`, `batch-detail.png`, `student-progress.png`, and `applied-jobs.png`.

Create the Admin/Talent Support screens and linked flow:
1. **JAT Batch Management**: batch list, search, phase dates, participant count and actions.
2. **Create/Edit Batch**: batch/program name; one or more bootcamp batches; Phase 1; optional Phase 2; multiple date ranges; job levels; applied-job targets; add/remove range/target controls; validation and confirmation on consequential edits.
3. **Batch Detail**: phase/date overview, targets, Student participants, add/remove participant controls.
4. **Student Progress**: student identity summary, overview per phase/range, targets, status and Applied Jobs table.
5. **Applied Jobs**: relevant job fields, validation status, recruitment progress, detail action, search and filters for phase/date range/status.
6. Empty, loading, validation-error and destructive-action confirmation states.

Interaction and data requirements:
- The Request tab is a separate queue and should display Waiting Confirmation items only in the intended workflow.
- Admin must be able to inspect original evidence and submitted data before acting.
- Any rejection flow that requires a reason must prompt for it.
- Batch date changes should show the impact/confirmation state.
- Recalculate controls should appear only for the role that is approved to use them; exact role is a decision to confirm.
- Do not claim actual API data. Use synthetic examples.

Make the flow clickable where supported. Reuse the same typography, colors, navigation and UI primitives as the Student screens. Do not add a new standalone Dashboard menu unless the product owner approves it.
