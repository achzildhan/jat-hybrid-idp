# Requirement-to-Design-to-Code Traceability

Use this table to track the prototype and later implementation. Update it only from actual design/code/test evidence.

| PRD ID | Screen(s) | Epic ID | Backlog ID(s) | Test ID(s) | State / Notes |
|---|---|---|---|---|---|
| JAT-BL-01 | Admin Batch List | EP-JAT-01 | BLG-JAT-001–004 | ep-jat-01.test.tsx | Implemented: batch listing, search, status filters, empty state recovery |
| JAT-BL-02 | Admin Create/Edit Batch | EP-JAT-01 | BLG-JAT-001–004 | ep-jat-01.test.tsx | Implemented: batch creation, editing, unique name validation (BR-01, BR-02) |
| JAT-BL-03 | Admin Create/Edit/Detail Batch | EP-JAT-01 | BLG-JAT-001–004 | ep-jat-01.test.tsx | Implemented: multi-phase (Phase 1 required, Phase 2 optional), date ranges, job targets |
| JAT-BL-04 | Admin Participant Management | EP-JAT-02 | BLG-JAT-005–008 | ep-jat-02.test.tsx | Implemented: participant list, add modal, student detail matrix, safe remove (BR-10) |
| JAT-BL-05 | Student Batch List/Detail | EP-JAT-03 | BLG-JAT-009–012 | ep-jat-03.test.tsx | Implemented: student batch view, phase cards, target breakdown, period gating (BR-06, BR-07, BR-14) |
| JAT-BL-06 | Student Add Application | EP-JAT-04 | BLG-JAT-013–016 | ep-jat-04.test.tsx | Implemented: 8 application fields, client validation, drawer interactions |
| JAT-BL-07 | Student Add Application | EP-JAT-04 | BLG-JAT-013–016 | ep-jat-04.test.tsx | Implemented: JPG/JPEG/PNG <= 5MB evidence validation, out-of-range checks (BR-11, BR-12, BR-14) |
| JAT-BL-08 | IDP review details (target) | EP-JAT-05 | BLG-JAT-017–019 | ep-jat-05.test.ts | Implemented: preprocessing, mock OCR engine adapter, text normalizer, structured attribute extractor (BR-39, BR-41) |
| JAT-BL-09 | IDP review details (target) | EP-JAT-06 | BLG-JAT-020–022 | ep-jat-06.test.ts | Implemented: deterministic rule validator, lexical similarity (>70% BR-40), assistive mock semantic comparator, decision policy (BR-38) |
| JAT-BL-10 | Student Application Detail | EP-JAT-07 | BLG-JAT-023–026 | ep-jat-07.test.tsx | Implemented: validation feedback, status badges, reason display, separation from recruitment stage (BR-28) |
| JAT-BL-11 | Admin Request queue/detail | EP-JAT-08 | BLG-JAT-027–030 | ep-jat-08.test.tsx | Implemented: Waiting Confirmation queue, evidence inspector modal, confirm/reject with reason (BR-24, BR-32) |
| JAT-BL-12 | Admin Applied Jobs | EP-JAT-09 | BLG-JAT-031–034 | ep-jat-09.test.tsx | Implemented: Applied Jobs table, search, multi-filter (phase, range, validation status) (BR-31) |
| JAT-BL-13 | Admin Progress/Monitoring | EP-JAT-10 | BLG-JAT-035–038 | ep-jat-10.test.tsx | Implemented: centralized progress calculator, cohort pacing distribution, zero hardcoded numbers |
| JAT-BL-14 | Student/ Admin date views | EP-JAT-10 | BLG-JAT-037–038 | ep-jat-10.test.tsx | Implemented: synchronized date boundaries, application snapshot window (BR-42) |
| JAT-BL-15 | Admin Monitoring | EP-JAT-10 | BLG-JAT-035–038 | ep-jat-10.test.tsx | Implemented: validation breakdown KPIs, capacity vs completed metrics, impact preview (BR-08) |
| JAT-BL-16 | Admin confirmation dialogs | EP-JAT-11 | BLG-JAT-040–041 | ep-jat-11.test.tsx | Implemented: exact-name verification for batch deletion, double-click protection (BR-09, DSN-TBD-05) |
| JAT-BL-17 | Role-dependent UI and API | EP-JAT-11 | BLG-JAT-039–041 | ep-jat-11.test.tsx | Implemented: service-level permission enforcement, Student vs Admin role guards (BR-33, BR-43) |
| JAT-BL-18 | QA test suite | EP-JAT-12 | BLG-JAT-042–044 | ep-jat-12.test.tsx | Implemented: full 9-step E2E integration test, comprehensive negative/edge regressions, 97/97 tests passed |
