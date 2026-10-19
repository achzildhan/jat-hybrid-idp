# DESIGN SYSTEM DOCUMENTATION: Job Application Tracking (JAT) — Dibimbing.id LMS
*Comprehensive Product-Level Audit, Token Specification, and Screen Consistency Guide*

---

## 1. Executive Summary & Design Principles

The **Job Application Tracking (JAT)** module is an integrated, high-velocity career accelerator embedded directly inside the Dibimbing.id Learning Management System (LMS). It serves two distinct personas operating in segregated navigational scopes:
1. **Student Persona (Bootcamp Participant)**: Discovers active cohort tracking periods, submits verified external job applications with screenshot attachments, tracks multi-phase quota progression (Junior / Senior requirements), and audits verification feedback.
2. **Admin / Talent Support Specialist Persona**: Configures multi-phase tracking schedules, manages student participant rosters, monitors cohort pacing metrics, and executes Human-in-the-Loop (HITL) evidence validation on incoming applications.

### Core Design Principles
- **Clarity over Automation**: Validation status (`Accepted / Approved`, `Declined / Rejected`, `Waiting Confirmation`) strictly indicates internal LMS compliance against cohort quota milestones, completely isolated from third-party recruitment stages (e.g., Applied, Technical Test, Interview, Offer). Status decisions are transparent, reviewable, and never disguised as automated or infallible AI decisions.
- **Calm, High-Density Information Architecture**: Optimized for daily administrative scanning and student focus. Tables, phase progression summary cards, and slide-over drawers balance information density with consistent whitespace rhythm (8px baseline), avoiding visual fatigue.
- **Contextual Role Segregation**: While Student and Admin interfaces share identical foundation tokens (typography, border radii, brand palette), their shell navigation, breadcrumb hierarchies, and action authorizations remain strictly partitioned.
- **Accessible & Resilient Ergonomics (WCAG AA)**: Dual-channel status communication pairs color tokens with clear iconography and descriptive localized copy. High contrast ratios (>= 4.5:1) ensure legibility across varied ambient lighting.

---

## 2. Inferred Tokens vs. Project Decisions

| Token Category | Inferred from Source References (`Dibimbing.id`) | New Project Decisions & Enhancements |
|---|---|---|
| **Primary Brand Colors** | Dibimbing Cyan (`#0BB1CB` / `#00A5B5`), Deep Slate (`#1E293B`, `#0F172A`) | Extended neutral surface hierarchy (`#F8FAFC`, `#F1F5F9`) with standard 1px borders (`#E2E8F0`) for crisp visual grouping. |
| **Status Tokens** | Green for Approved/Achieved, Amber for Waiting/Pending, Red for Rejected/Not Achieved | Standardized accessible WCAG AA pairs: Emerald (`#ECFDF5`/`#065F46`), Amber (`#FEF3C7`/`#92400E`), Rose (`#FEE2E2`/`#991B1B`), Slate (`#F1F5F9`/`#475569`). |
| **Typography** | Sans-serif geometry (Plus Jakarta Sans / Inter), bold tabular numbers | Formalized 6-tier typographic scale with fixed line-height ratios and uppercase micro-labels (`tracking-wider`, `text-[11px]`). |
| **Layout & Chrome** | Persistent left sidebar (240px desktop), top header bar with search and profile badge | Standardized collapsible slide-over right drawers (540px–680px) and centered confirmation modal dialogs with backdrop blur (`backdrop-blur-sm bg-slate-900/40`). |
| **Navigation Tabs** | Pill sub-tabs (`Daftar Batch JAT` vs `Request`) with numeric badge count | Added sticky context header, standardized back-links (`Kembali ke...`), and Super Admin permission guards on destructive/recalculation triggers. |

---

## 3. Color Tokens & Semantic Roles

### 3.1 Brand & Accent Palette
- **Primary Brand Teal**: `#0BB1CB` (`var(--primary)`) — Active navigation indicators, primary CTA buttons (`+ Add Proof of Application`, `+ Buat Batch Baru`, `+ Tambah Student ke Batch`), active tab highlights, and achievement rings.
- **Primary Brand Hover**: `#0891A5` (`var(--primary-dark)`) — Hover and focus-visible states for primary interactive elements.
- **Primary Brand Subtle**: `#E0F7FA` / `#ECFEFF` (`var(--primary-subtle)`) — Tab highlight backgrounds and active pill selections.

### 3.2 Neutral & Surface Hierarchy
- **Canvas Base Background**: `#F8FAFC` (`slate-50`) / `#F9F9FF` — Calm, non-glare desktop canvas surface.
- **Surface Container (Lowest / Base Cards)**: `#FFFFFF` — White container backgrounds for cards, tables, drawers, and modal panels.
- **Surface Container Low (Muted Bars)**: `#F1F5F9` (`slate-100`) — Table headers, disabled input states, badge backgrounds.
- **Divider & Border Lines**: `#E2E8F0` (`slate-200`) — 1px consistent structural borders.
- **Subtle Accent Dividers**: `#CBD5E1` (`slate-300`) — Focus boundaries and hover borders on form inputs.

### 3.3 Text & Icon Hierarchy
- **Text Primary (Headings, Key Titles)**: `#0F172A` / `#1E293B` (`slate-900` / `slate-800`) — High contrast readability.
- **Text Secondary (Labels, Table Content)**: `#334155` / `#475569` (`slate-700` / `slate-600`) — Standard body and descriptive text.
- **Text Muted (Placeholders, Column Sub-labels)**: `#64748B` / `#94A3B8` (`slate-500` / `slate-400`) — Secondary timestamps, inactive icons, helper copy.

### 3.4 Validation & Status Semantic Matrix
*Note: LMS verification status is never coupled with third-party hiring progress.*
- **Approved / Accepted / Target Achieved**:
  - Background: `#ECFDF5` (`emerald-50`)
  - Border: `#A7F3D0` (`emerald-200`)
  - Text & Icon: `#065F46` (`emerald-800`)
- **Waiting Confirmation / In Review**:
  - Background: `#FEF3C7` (`amber-50`)
  - Border: `#FDE68A` (`amber-200`)
  - Text & Icon: `#92400E` (`amber-800`)
- **Declined / Rejected / Target Not Achieved**:
  - Background: `#FEE2E2` (`rose-50`)
  - Border: `#FECDD3` (`rose-200`)
  - Text & Icon: `#991B1B` (`rose-800`)
- **Belum Dimulai / Upcoming Cycle**:
  - Background: `#F1F5F9` (`slate-100`)
  - Border: `#E2E8F0` (`slate-200`)
  - Text & Icon: `#475569` (`slate-600`)

---

## 4. Typography System

**Primary Font Family**: `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif.

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display / Page Header** | 24px (`1.5rem`) | Bold (`700`) | 32px | Page titles (`Job Application Tracking (JAT)`, `Detail Student`) |
| **Section Header (H2)** | 18px (`1.125rem`) | SemiBold (`600`) | 26px | Card headers (`Phase 1`, `Student Participant on This Batch`) |
| **Subsection Header (H3)** | 15px (`0.9375rem`) | SemiBold (`600`) | 22px | Group headers, Drawer titles, Modal confirmation titles |
| **Body Standard** | 14px (`0.875rem`) | Regular (`400`) / Medium (`500`) | 20px | Table cell content, form input fields, general copy |
| **Body Compact / Meta** | 12px (`0.75rem`) | Medium (`500`) | 16px | Timestamps, helper tips, breadcrumbs, table secondary text |
| **Micro Caption / Overline** | 11px (`0.6875rem`) | SemiBold (`600`), Uppercase | 14px | Table column headers (`BATCH`, `PHASE`, `STATUS`), tag indicators |

---

## 5. Spacing, Rhythm & Spatial Boundaries

All components and page grids conform strictly to an **8px base grid** with 4px half-steps:
- **`space-1` (4px)**: Pill gaps, micro badge padding, inline icon-text spacing.
- **`space-2` (8px)**: Input internal padding (vertical), cell tight spacing, card action gaps.
- **`space-3` (12px)**: Form field vertical gaps, table cell vertical padding.
- **`space-4` (16px)**: Standard container padding, card header-to-body spacing.
- **`space-6` (24px)**: Outer page horizontal gutters, space between stacked dashboard cards.
- **`space-8` (32px)**: Section division margins, modal window internal padding.

---

## 6. Core Component Catalog & Interaction Specifications

### 6.1 Left Navigation Sidebar & Shell
- **Student Shell**: Active section is `Talent Support` with sub-tab indicator on `Job Application Tracking`. Footer includes avatar badge and Light/Dark mode toggle.
- **Admin Shell**: Active section is `Talent Support` > `Job Application Tracking` (or top pill switcher between `Daftar Batch JAT` and `Request`). Top navigation bar hosts global search and Admin profile.

### 6.2 Data Tables & Bulk Operations
- **Header Structure**: Sticky `#F8FAFC` background with 11px uppercase bold labels, sorting chevrons (`↕`), and bottom 1px border.
- **Bulk Action States**: 
  - *Inactive State*: Standard checkbox column with 0 selected counter, bulk action bar hidden or disabled.
  - *Active State*: Header shows selection summary banner with floating quick-confirm CTA (`Konfirmasi Terpilih (N)`).
- **Pagination Component**: Displays exact record ranges (`Menampilkan X dari Y Data`), records-per-page selector (`Show: 10 Data`), previous/next buttons, and active page pill.

### 6.3 Slide-Over Drawers & Inspection Panels
- **Position & Sizing**: Right viewport boundary, `w-full max-w-xl` (~540px to 680px), full vertical height.
- **Backdrop**: `#0F172A` with 40%–50% opacity (`bg-slate-900/40 backdrop-blur-sm`).
- **Footer**: Sticky action bar containing secondary cancel button and primary action (`Submit Proof` / `Konfirmasi JAT`).

### 6.4 Confirmation Modals & Dialogs
- **Delete Confirmation Dialog**: Centered 440px modal with red destructive styling, explicit confirmation text identifying target item, and clear cancel trigger.
- **Save Batch Confirmation Dialog**: Centered modal confirming cohort activation with secondary edit trigger and primary cyan CTA.
- **Batch Enrollment Modal**: Multi-select participant picker with search, cohort filter, and dedicated empty search state.

### 6.5 Empty States & Error Feedback
- **Zero-State Batch**: Clean illustration badge, encouraging header (*"Belum Ada Siswa di Batch Ini"*), and dual recovery actions (*"+ Tambah Student ke Batch"* & *"Import Siswa dari Cohort"*).
- **Filter Empty State**: Contextual message explaining no records matched the active filter criteria, accompanied by clear recovery triggers (*"Reset Filter"* & *"Ubah Kriteria Filter"*).
- **Modal Empty Search**: Specific feedback mentioning the query string and cohort scope, with a quick reset button.

---

## 7. Prototype Paths & Verification Check

1. **Student Flow**:
   - `Student - JAT Batch List` (`SCREEN_73`) ──► Click "Show Detail" ──► `Student - JAT Batch Detail & Tracking` (`SCREEN_35`)
   - `Batch Detail` ──► Click "+ Add Proof of Application" ──► `Add Proof Drawer` (`SCREEN_32`)
   - `Batch Detail` ──► Click row item ──► `Application Detail & Status Variants` (`SCREEN_67`) ──► Click Retract/Delete ──► `Delete Confirmation Modal` (`SCREEN_30`)
2. **Admin Cohort Management Flow**:
   - `Batch Management` (`SCREEN_55`) ──► Click "+ Buat Batch Baru" ──► `Create & Edit Batch` (`SCREEN_53`) ──► Open Datepicker (`SCREEN_18`) / Open Cohort Picker (`SCREEN_20`) ──► Click Save ──► `Save Confirmation Modal` (`SCREEN_16`)
   - `Batch Management` ──► Click Batch Row ──► `Batch Detail & Participants` (`SCREEN_49` / `SCREEN_6` Zero State)
   - `Batch Detail` ──► Filter participants (`SCREEN_10` / `SCREEN_8` Empty State)
   - `Batch Detail` ──► Click "+ Tambah Student" ──► `Modal Tambah Student` (`SCREEN_4` / `SCREEN_2` Empty Search)
   - `Batch Detail` ──► Click Student eye icon ──► `Student Progress & Applied Jobs` (`SCREEN_51`) ──► Filter applied jobs (`SCREEN_12`) ──► Click Remove ──► `Hapus dari Batch Modal` (`SCREEN_14`)
3. **Admin HITL Verification Flow**:
   - `Batch Management` ──► Click "Request" Tab ──► `Request Queue Table` (`SCREEN_28` / `SCREEN_22` Bulk Inactive)
   - `Request Queue` ──► Click "Konfirmasi" ──► `HITL Evidence Review & Inspector` (`SCREEN_37`)

---

## 8. Accessibility & Responsiveness Audit Notes

- **Contrast Ratios**: Body text meets >= 7:1 contrast; status chips and auxiliary labels achieve >= 4.5:1.
- **Focus Rings**: Standardized `focus-visible:ring-2 focus-visible:ring-[#0BB1CB] focus-visible:outline-none`.
- **Labels & Forms**: Form fields contain visible permanent `<label>` tags with mandatory asterisk indicators.
- **Responsive Behavior**: Standard desktop width (1280px–1440px) maintains persistent 240px sidebar and multi-column comparison grids. Under 1024px, drawers expand to full width and table rows allow horizontal scrolling.

---

## 9. Product & Business Rule Questions for Product Owner

1. **Recalculation Authorization**: Is progress recalculation strictly reserved for Super Admins, or should Batch Admins have permission upon milestone edits?
2. **Declined Application Re-submission**: Can a student edit and re-submit a rejected application directly, or must they submit a new entry while retaining the historical audit log?
3. **Bulk Approval Constraints**: In bulk verification, should high-risk submissions (e.g. uncertain OCR extraction or missing vacancy links) be excluded from bulk actions and forced into manual HITL review?
