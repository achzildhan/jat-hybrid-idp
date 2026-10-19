# TECHNICAL HANDOFF & IMPLEMENTATION SPECIFICATION
## Job Application Tracking (JAT) — Dibimbing.id LMS

---

## 1. System Architecture & Role Scopes

The Job Application Tracking (JAT) module is an integrated career acceleration tool inside the Dibimbing.id Learning Management System (LMS). It operates under two distinct role scopes with strict access boundaries:

1. **Student Persona (Bootcamp Participant)**
   - Access Scope: `Talent Support` > `Job Application Tracking`
   - Primary Goal: Submit verified external job applications against multi-tiered cohort targets, inspect verification status, view reviewer feedback, and manage submissions.
2. **Admin / Talent Support Specialist Persona**
   - Access Scope: `Talent & Career` > `Job Application Tracking`
   - Primary Goal: Schedule cohort batches, configure Phase 1/Phase 2 date ranges and targets, audit student velocity, and execute Human-in-the-Loop (HITL) evidence validation on incoming applications.

---

## 2. Interactive Flows & Prototype Paths

### Flow A: Student Journey (Submission & Lifecycle)
```
[Screen 35: Batch List]
   │
   ▼ (Click "Show Detail" on Active Batch)
[Screen 33: Batch Detail & Tracking]
   │
   ▼ (Click "+ Add Proof of Application")
[Screen 31: Add Proof of Application Drawer]
   │  ├── Validates: Date in range, JPG/PNG <= 5MB, required fields
   │  └── Simulates error triggers (format mismatch, future date)
   │
   ▼ (Click "Submit Proof")
[Screen 29: Application Detail & Status Variants]
   ├── State 1: "Waiting Confirmation" (Under review queue)
   ├── State 2: "Accepted / Approved" (Target counter increments)
   ├── State 3: "Declined / Rejected" (Displays reviewer feedback note)
   └── Sub-Modal: "Delete Proof of Application" (Retract before verification)
```

### Flow B: Admin Cohort & Participant Management
```
[Screen 17: Batch Management]
   │
   ├──► (Click "+ Buat Batch Baru")
   │       │
   │       ▼
   │    [Screen 15: Create / Edit Batch JAT]
   │       ├── Multi-select bootcamp cohorts
   │       ├── Phase 1 & Phase 2 date range builder
   │       ├── Target quotas per job level (Junior / Mid / Senior)
   │       └── Consequential edit warning banner
   │
   └──► (Click "Detail" icon on Batch Row)
           │
           ▼
        [Screen 11: Batch Detail & Participants]
           ├── Phase breakdown cards & quota targets
           ├── Super Admin "Recalculate Progress" action guard
           └── Student participant roster with individual phase progress
                   │
                   ▼ (Click "Inspect" eye icon on student)
                [Screen 13: Student Progress & Applied Jobs Inspection]
                   ├── Student achievement metrics (target ratio, approval rate)
                   ├── Date range target achievement matrix
                   └── Complete Applied Jobs history with filter triggers
```

### Flow C: Admin HITL Evidence Verification Queue
```
[Screen 3: Request Queue & Filters] (Under "Request" Tab, default: Waiting Confirmation)
   │
   ├── Filter by: Batch, Phase, Date Range
   │
   ▼ (Click "Konfirmasi" button on submission row)
[Screen 5: HITL Evidence Review & Inspector]
   ├── Side-by-side evidence preview (Student Attachment vs Submitted Form)
   ├── Assisted extraction checks (Demo / Mock Assistant banner)
   ├── Action 1: "Iya" (Approve) ──► Transitions status to Approved & updates student quota
   └── Action 2: "Tidak" (Reject) ──► Requires mandatory rejection rationale textarea
```

---

## 3. Screen Inventory & Supported UI States

| Ref Screen ID | Title | Route / Archetype | Supported UI States & Key Interactive Components |
|---|---|---|---|
| `SCREEN_35` | **Student - JAT Batch List** | `/student/talent-support/jat` | • Active batch listing with target fraction pill (`8/10`)<br>• Upcoming / inactive batch rows<br>• Hover states on `Show Detail` and pagination buttons |
| `SCREEN_33` | **Student - JAT Batch Detail & Tracking** | `/student/talent-support/jat/:batchId` | • Progress meter summary (`19/40`)<br>• Multi-phase collapsible progress cards (Phase 1 Achieved vs Not Achieved)<br>• Search & status filter popover<br>• Applied jobs data table with dual-channel status badges |
| `SCREEN_31` | **Student - JAT Add Proof of Application Drawer** | Slide-over Drawer | • Form input states (default, filled, focus ring, validation error)<br>• Date boundary restriction validator banner<br>• Drag-and-drop file upload zone (JPG, JPEG, PNG <= 5MB)<br>• Error simulation toggle button for dev testing |
| `SCREEN_29` | **Student - JAT Application Detail & Status Variants** | Drawer / Modal Overlay | • Read-only submission attribute breakdown<br>• Evidence image viewer container<br>• Validation status variants (`Accepted`, `Waiting Confirmation`, `Declined`)<br>• Reviewer feedback quote block<br>• Pop-up modal: Delete Confirmation (`Cancel` vs `Delete`) |
| `SCREEN_17` | **Admin - JAT Batch Management** | `/admin/jat/batches` | • Pill switcher between `Daftar Batch JAT` and `Request`<br>• Multi-column phase schedule matrix (Phase 1 & 2 start/end dates)<br>• Cohort performance summary footer cards |
| `SCREEN_15` | **Admin - Create & Edit Batch JAT** | `/admin/jat/batches/create` | • Multi-select dropdown for bootcamp cohorts<br>• Dynamic date range builder (`+ Add Date Range`, `Remove Date Range`)<br>• Job level quota inputs (Junior, Mid, Senior)<br>• Consequential recalculation impact banner |
| `SCREEN_11` | **Admin - JAT Batch Detail & Participants** | `/admin/jat/batches/:id` | • Phase target summary cards<br>• Permission guard: `Recalculate Progress (Super Admin Only)`<br>• Participant table with progress bars, search, and `+ Tambah Student` |
| `SCREEN_13` | **Admin - Student Progress & Applied Jobs** | `/admin/jat/students/:studentId` | • Individual student summary card & approval rate pill<br>• Milestone target matrix (`Tercapai`, `Tidak Tercapai`, `Belum Dimulai`)<br>• Full applied jobs table with CSV Export trigger and multi-facet filter |
| `SCREEN_3` | **Admin - JAT Request Queue & Filters** | `/admin/jat/requests` | • Dedicated `Waiting Confirmation` review queue<br>• Business rule banner (*"Status Verifikasi Admin ≠ Status Rekrutmen"* )<br>• Multi-criteria filter popover (Batch, Phase, Date Range) |
| `SCREEN_5` | **Admin - JAT HITL Evidence Review & Inspector** | Slide-over Inspector | • Side-by-side evidence preview (image attachment vs form metadata)<br>• Assisted extraction indicator banner (`Demo / Mock Extraction Assistant`)<br>• HITL Decision Matrix: `Iya` (Approve) vs `Tidak` (Reject)<br>• Mandatory rejection reason input field |

---

## 4. Mock / Synthetic Data Disclosure

To ensure zero ambiguity during frontend implementation:
- **Assisted Extraction / OCR**: The checks shown on `SCREEN_5` are **synthetic visual mocks** representing the intended Human-in-the-Loop review pattern. The product does **not** claim automated closed-vacancy detection or infallible AI decisioning.
- **Quota Metrics & Calculation**: Target fractions (e.g. `8/10`, `19/40`) and progress rings are hardcoded prototype mocks. In production, these must be derived from backend cohort rule aggregations.
- **Student Data**: All student names (`Marvin McKinney`, `Ethan Caldwell`, `Annette Black`), company names, and dates are synthetic fixtures.

---

## 5. Antigravity & Frontend Code Handoff Instructions

### Manual Export & Handoff Path
If direct Google Antigravity cloud synchronization is not configured in your current workspace, use the standardized repository export structure below:

```text
/jat-module/
├── DESIGN.md                          <-- Design System & Token Specification (from DOCUMENT_2)
├── /specs/
│   └── handoff-spec.md                <-- This document
├── /assets/
│   ├── /brand/                        <-- Dibimbing logos and UI icons
│   └── /mocks/                        <-- Sample evidence images (.png, .jpg)
└── /components/
    ├── /student/
    │   ├── BatchListTable.tsx
    │   ├── BatchProgressCard.tsx
    │   ├── AddProofDrawer.tsx
    │   └── ApplicationDetailModal.tsx
    └── /admin/
        ├── BatchManagementTable.tsx
        ├── BatchScheduleBuilder.tsx
        ├── ParticipantRosterTable.tsx
        ├── StudentProgressSummary.tsx
        ├── RequestQueueTable.tsx
        └── HitlEvidenceInspector.tsx
```

### Critical CSS / Token Rules for Frontend Engineering:
- **Tailwind Font**: `Plus Jakarta Sans`, sans-serif.
- **Primary Brand Tokens**: `var(--color-primary: #0bb1cb)`, `var(--color-primary-hover: #0891a5)`.
- **Status Badges**: Dual-channel (always pair color with an icon and explicit text). Do not rely solely on color.
- **Modals & Drawers**: Backdrop uses `backdrop-blur-sm bg-slate-900/40`.
