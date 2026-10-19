# System Requirements — JAT Hybrid IDP Prototype

## 1. Scope and maturity

This folder starts as a new project with no production source code. First milestone is a frontend prototype based on the PRD and approved Stitch design. Real backend, database, OCR/IDP and LLM integrations are later decisions. Treat all prototype validation outcomes as simulated.

## 2. Proposed phased architecture

### Phase A — UI prototype

- Recommended stack: React + TypeScript + Vite + Tailwind CSS + React Router.
- Local synthetic fixture data and local component state.
- Separate mock repositories/adapters from UI components.
- No production credentials, real Student records, or claims of AI verification.

### Phase B — application service

- Choose backend, database, file storage and authentication only after data contracts and integration needs are reviewed.
- Document actual language, framework, version, API style, deployment, and secrets handling before implementation.
- Enforce file type, size, date range, role permissions, field validation and data integrity on the trusted server side.

### Phase C — Hybrid IDP

Conceptual pipeline: uploaded image → input/file rules → image quality/evidence sufficiency checks → image preprocessing (if used) → OCR → extraction to structured attributes → deterministic rule checks → approved LLM semantic check (if needed) → validation decision → HITL when uncertain → saved status/result.

Do not presuppose Tesseract, OpenCV, Gemini, ChatGPT, a particular SDK, model, or OCR SaaS as the production choice. The prior testing artifacts mention ChatGPT and Gemini in some test comparisons but do not establish model/API versions or production integration details.

## 3. Prototype stack decision record

| Area | Prototype recommendation | Status / rationale |
|---|---|---|
| UI | React + TypeScript | Proposed; good for reusable multi-screen UI. |
| Build tool | Vite | Proposed for fast local prototyping. |
| Styling | Tailwind CSS | Proposed; validate against actual exported Stitch design and `DESIGN.md`. |
| Routing | React Router | Proposed if multiple route-level screens are needed. |
| UI icons | One consistent icon package, chosen after design review | TBD; avoid mixing icon sets. |
| State | React state/context initially; add a state library only if complexity requires | Proposed to keep prototype lean. |
| Form validation | Use the project-compatible validation approach after scaffold; business rules duplicated in tests | TBD. |
| Backend | Not selected | Must align with intended integration and team skills. |
| Database | Not selected | Design logical entities first; do not invent production schema. |
| File storage | Not selected | In prototype, use local browser preview/mock only. |
| OCR | Not selected | Compare options against language, image quality, cost, privacy and integration. |
| LLM | Not selected | Compare options using the same evaluation set, cost, latency, and privacy. |
| Automated tests | Select after scaffold | Add component/logic/API/end-to-end tests appropriate to the chosen stack. |

## 4. Conceptual data entities

Logical concepts, not final database table names:

- JAT Batch
- Phase
- Date Range
- Job Level Target
- Student Participant
- Job Application Submission
- Evidence File / File Metadata
- Extraction Result
- Validation Result
- Human Review Action
- Recruitment Progress

A submission can link to its batch/phase/date range, participant, evidence file, extracted attributes and validation result. The validation status and recruitment progress are separate. Physical schema and retention policy remain TBD.

## 5. Core field groups

### Batch
Batch/program name, associated bootcamp batch(es), phase(s), date ranges, job-level targets and application targets.

### Student submission
Date Applied, Role, Company, Location, Position, Job Level, Work System, Year of Experience, Job Vacancy Link, Evidence image reference.

### IDP output (conceptual)
Extracted attributes; missing/unknown fields; evidence sufficiency or uncertainty flags; attribute comparison outcomes; validation status; concise reason; model/provider/prompt version if used and available. Keep output schema versioned.

### Human review
Reviewer action, resulting status, reason if rejected, timestamp/actor when real authentication is available. For prototype, simulate this without real personal data.

## 6. Quality requirements

- UX: consistent with approved Stitch/Figma reference, responsive layouts, keyboard navigation, semantic labels, visible focus and accessible contrast.
- Correctness: rules are testable and do not depend only on prompts/LLM.
- Reliability: user sees clear loading, success, error, empty, and blocked states.
- Traceability: PRD requirement → backlog → code → test case.
- Maintainability: reusable UI; typed models; isolate mock adapters and external services.
- Security: no secret values in code, safe upload handling, authorization on server, sensitive data minimization.
- Privacy: use synthetic proof images for demo; obtain authorization before sending sensitive documents to external AI services.
- Observability: log identifiers/statuses and concise error codes; avoid raw sensitive screenshots/full prompts unless approved.
- Performance: define measurable thresholds only after baseline and environment are known.

## 7. Hybrid IDP evaluation design

- Create a labeled evaluation set containing correct match, field mismatches, cropped/missing evidence, low quality, irrelevant image, ambiguous fields, and date/file rule failures.
- Ground truth and expected status must be defined by agreed rules, not copied from the model output.
- Record actual result, expected result, error type, model/provider/config, and evidence ID.
- Compute confusion matrix and accuracy/precision/recall/F1 only after collecting labeled results and defining positive classes. Include Waiting Confirmation explicitly in class policy.
- Re-run the same regression set after rule or prompt changes.
- Do not claim model training/fine-tuning unless actually conducted and documented.

## 8. Open architecture decisions

1. Whether this remains a standalone demo or later connects to authorized LMS APIs.
2. Backend/API technology and authentication/authorization.
3. Database and evidence storage/retention.
4. OCR service/library and image preprocessing approach.
5. LLM provider/model, integration method, cost/latency/security requirements.
6. Exact field-level validation policy and final status transition rules.
7. Test framework and performance thresholds.
8. Whether UI export from Stitch will be integrated as source or used as reference for a clean reusable implementation.
