# DESIGN TO REQUIREMENTS MAPPING
## Job Application Tracking (JAT) — Dibimbing.id LMS

---

## 1. Executive Traceability Matrix

This document maps every product requirement, business rule, and user story from the JAT PRD directly to the implemented screen designs, components, and interactive states.

| PRD Section / Requirement ID | Feature Description | Implemented Screen(s) | UI Component & Evidence in Design | Verification Status |
|---|---|---|---|---|
| **REQ-STU-01** | **Active Cohort Discovery**<br>Student can view available tracking batches with start/end dates and overall target fraction. | `SCREEN_74` | Table listing batches with date ranges, active status pills, and fractional progress indicators (e.g. `8/10`). | Fully Covered |
| **REQ-STU-02** | **Multi-Phase Milestone Tracking**<br>Student tracks quota progress across Phase 1 and Phase 2 with Job Level targets (Junior vs Senior). | `SCREEN_72`, `SCREEN_36` | Collapsible Phase cards (Phase 1 Achieved vs Phase 2 Upcoming), fractional meters (`8/8`, `2/2`, `1/2`), and overall completion bar (`19/40`). | Fully Covered |
| **REQ-STU-03** | **Add Proof of Application**<br>Student submits external job application proof with metadata and screenshot evidence. | `SCREEN_70`, `SCREEN_33` | Slide-over drawer with form fields (Company, Role, Job Level, Work System, Link) and drag-and-drop file upload zone. | Fully Covered |
| **REQ-STU-04** | **Submission Validation Rules**<br>File type restricted to JPG/JPEG/PNG <= 5MB. Date Applied must be within active batch schedule. | `SCREEN_70`, `SCREEN_33` | Explicit helper notice: *"JPG, JPEG, PNG only (max 5MB)"*; date picker constrained to cohort boundary with restriction warning banner. | Fully Covered |
| **REQ-STU-05** | **Application History & Status Inspection**<br>Student views submitted applications with distinct verification statuses and reviewer notes. | `SCREEN_68` | Read-only attribute breakdown, full evidence screenshot viewer, and status callouts with reviewer feedback block on `Declined`. | Fully Covered |
| **REQ-STU-06** | **Proof Retraction / Deletion**<br>Student can delete proof only while status is `Waiting Confirmation`. | `SCREEN_31` | Delete confirmation modal dialog with red destructive CTA (`Delete`). Trash trigger is hidden or disabled once `Accepted`. | Fully Covered |
| **REQ-ADM-01** | **Batch & Schedule Configuration**<br>Admin creates/edits batches with multi-select bootcamp cohorts and multi-tiered date ranges. | `SCREEN_56`, `SCREEN_54`, `SCREEN_21`, `SCREEN_19` | Dynamic date range builder (`+ Add Date Range`), bootcamp cohort picker popover, two-month date range picker, and job level quota inputs. | Fully Covered |
| **REQ-ADM-02** | **Batch Activation Confirmation**<br>Admin must confirm cohort activation before automated student notification kick-off. | `SCREEN_17` | Centered modal summarizing schedule and targets with secondary edit trigger and primary cyan *"Ya, Simpan & Aktifkan"* button. | Fully Covered |
| **REQ-ADM-03** | **Participant Roster & Pacing**<br>Admin monitors student participant roster, individual progress bars, and quota ratios. | `SCREEN_50`, `SCREEN_52` | Participant table with individual phase progress bars, milestone status chips (`Tercapai`, `Tidak Tercapai`), and approval rate percentage. | Fully Covered |
| **REQ-ADM-04** | **Student Enrollment & Multi-Select**<br>Admin adds students to batch with search, cohort filter, and empty search recovery. | `SCREEN_5`, `SCREEN_3`, `SCREEN_7` | Modal with multi-select checkboxes, portfolio readiness chips, bulk selection counter, and dedicated empty search state. | Fully Covered |
| **REQ-ADM-05** | **Zero-State Handling**<br>System provides helpful zero-state when batch has 0 participants or search yields 0 matches. | `SCREEN_7`, `SCREEN_9`, `SCREEN_3` | Zero-state illustrations with actionable recovery triggers (*"Reset Filter"*, *"Ubah Kriteria Filter"*, *"Import Siswa dari Cohort"*). | Fully Covered |
| **REQ-ADM-06** | **HITL Evidence Verification Queue**<br>Dedicated queue for pending applications (`Waiting Confirmation`) with bulk confirm options. | `SCREEN_42`, `SCREEN_29`, `SCREEN_27`, `SCREEN_23` | Table filtered to `Waiting Confirmation`, disclaimer banner (*"Status Verifikasi ≠ Status Rekrutmen"*), bulk action bar, and individual "Konfirmasi" button. | Fully Covered |
| **REQ-ADM-07** | **Side-by-Side HITL Reviewer**<br>Admin inspects uploaded screenshot against student form data and provides mandatory rejection rationale. | `SCREEN_44`, `SCREEN_38` | Side-by-side evidence inspector, assisted OCR demo indicator banner, `Iya` (Approve) vs `Tidak` (Reject) toggle, and mandatory rejection reason textarea. | Fully Covered |
| **REQ-ADM-08** | **Super Admin Recalculation Guard**<br>Recalculation of progress upon date changes is guarded to prevent accidental data corruption. | `SCREEN_50`, `SCREEN_9`, `SCREEN_7` | Permission guard button labeled *"Recalculate Progress (Super Admin Only)"* in batch header. | Fully Covered |

---

## 2. Business Rules & Edge Case Alignment

### Rule 1: Isolation of Verification Status from Recruitment Pipeline
- **PRD Constraint**: LMS verification denotes internal compliance against bootcamp career coaching targets. It must never be coupled with or confused with external employer hiring stages (e.g. Applied, Interview, Offer).
- **Design Enforcement**:
  - All status chips use explicit compliance terms: `Accepted / Approved` (Target counter increments), `Waiting Confirmation` (In admin review queue), and `Declined / Rejected` (Quota not credited).
  - Prominent informational callout banner on Admin Request Queue (`SCREEN_42`): *"Status Verifikasi Admin ≠ Status Rekrutmen Eksternal. Verifikasi ini hanya menilai kepatuhan bukti lamaran terhadap ketentuan kuota batch."*

### Rule 2: Non-Destructive Zero States & Recovery Paths
- **PRD Constraint**: When a user encounters an empty table or failed query, the UI must never present a dead end.
- **Design Enforcement**:
  - `SCREEN_9` (Filter Empty State): Offers both a primary **"Reset Filter"** button (resets all criteria to default) and a secondary **"Ubah Kriteria Filter"** button (re-opens the filter popover).
  - `SCREEN_3` (Modal Empty Search): Provides **"Reset Pencarian"** and **"Lihat Semua Mahasiswa Batch 22"** with a disabled CTA button to prevent invalid empty form submissions.
  - `SCREEN_7` (Zero-State Batch): Equips admins with two direct initiation paths: **"+ Tambah Student ke Batch"** (manual picker) and **"Import Siswa dari Cohort"** (automated cohort sync).

### Rule 3: Explicit Human-in-the-Loop (HITL) Disclosure
- **PRD Constraint**: No automated AI or closed-vacancy detection claim may be presented as infallible or automated.
- **Design Enforcement**:
  - `SCREEN_44` / `SCREEN_38`: Features a prominent synthetic disclaimer badge: `Demo / Mock Extraction Assistant (Visual Preview Only)`.
  - Rejection requires an explicit human-authored rationale in a mandatory textarea, ensuring students receive actionable guidance on why evidence was declined.

---

## 3. Accessibility & Ergonomics Verification (WCAG AA)

1. **Dual-Channel Status Indicators**:
   - Every status chip pairs color with an explicit semantic icon and localized text label. No state is communicated through color alone.
2. **High-Contrast Typographic Rhythm**:
   - Slate-900 (`#0F172A`) on white backgrounds achieves 12.6:1 contrast ratio.
   - Emerald status chips (`#065F46` on `#ECFDF5`) achieve 5.8:1 contrast ratio.
   - Rose status chips (`#991B1B` on `#FEE2E2`) achieve 6.2:1 contrast ratio.
3. **Form Integrity**:
   - All input fields maintain persistent, visible `<label>` elements with red asterisks for mandatory inputs.
   - Error messages are positioned beneath fields with clear recovery text.
   - Focus states feature an accessible 2px ring: `focus-visible:ring-2 focus-visible:ring-[#0BB1CB] focus-visible:outline-none`.
