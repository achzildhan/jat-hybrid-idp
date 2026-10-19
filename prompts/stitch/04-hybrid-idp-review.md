# Stitch Prompt 04 — Validation Inspector and HITL review

Design the Admin/Talent Support Request queue and application evidence-review experience. Use `design-reference/request/request-list.png`, `request-filter.png`, `request-detail.png`, and `review-states.png` as the visual reference, while preserving the approved Stitch design direction.

Create:
- Request table with Batch, Phase, Date Range, Student, Company, Role, Date Applied, Created At, Validation Status, and Action when those fields are available.
- Filters for batch, phase, date range; queue defaults to Waiting Confirmation.
- Review drawer/detail with original image, submitted fields, extracted values only if available, field-level match/mismatch/unknown indicators, concise reasons, and links/attachments.
- Actions to approve/confirm or reject; require a rejection reason when business rules require it.
- Confirmation dialogs and resulting states after action.
- Empty, loading and error states.

The review experience may reserve a section for OCR/extraction evidence, but do not fabricate OCR text or confidence scores. In the design prototype, explicitly label extraction and AI results as demo/mock data. Do not claim the product can detect a closed vacancy without an approved reliable data source.

Design status behaviors:
- Approved: evidence and required attributes satisfy approved business rules.
- Rejected: a clear mismatch or rule violation is established.
- Waiting Confirmation: evidence is insufficient, ambiguous, cropped, unreadable or needs human review.

Do not equate validation status with recruitment progress. Provide a transparent explanation of why the item requires review and what action the Admin is taking.
