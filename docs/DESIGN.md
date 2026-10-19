# Design System & Implementation Specification — JAT Hybrid IDP

> **Source of Truth Disclosure:**
> This document synthesizes the official design system asset (`assets/53884af2d33c4172a6c129c0419edce3` — *"Dibimbing LMS - Job Application Tracking"*), the Stitch-authored `DESIGN.md` (`screens/a79e1f32e2c3499092616552697e2d9a`), the Stitch `JAT Technical Handoff & Specification` (`screens/d6c30899e0fd4d739282359e056be825`), and the actual Tailwind CSS configurations embedded in the 23 exported HTML screens from Stitch Project `projects/5548734684114454711` (*"Job Application Tracker UI"*).
> Information retrieved directly from Stitch is clearly separated from unresolved engineering/product decisions (`TBD`).

---

## 1. Brand & Aesthetic Direction (Retrieved from Stitch)

The **Job Application Tracking (JAT)** module is an EdTech career acceleration workspace within the Dibimbing.id Learning Management System (LMS). It supports two distinct personas operating in separate navigational scopes:
1. **Student (Bootcamp Participant):** Views assigned JAT batches and active phase windows, tracks application quotas across job levels, submits job application proofs with screenshot evidence, inspects validation statuses and reviewer feedback, and retracts unverified (`Waiting Confirmation`) submissions.
2. **Admin / Talent Support Specialist:** Configures JAT batches, links bootcamp cohorts, defines Phase 1 and optional Phase 2 date ranges and job-level targets, manages student rosters, monitors individual progress and applied jobs, and executes Human-in-the-Loop (HITL) evidence verification on `Waiting Confirmation` requests.

### Core Visual Principles
- **Clarity over Ornament:** Structured data tables, explicit dual-channel status pills (icon + color + text), and focused slide-over drawers and modal workflows.
- **Calm Motivation:** Energetic cyan/teal brand accents (`#0BB1CB` / `#00A5B5` / `#006878`) balanced with soothing neutral slates (`#F8FAFC`, `#F1F5F9`) and crisp white card surfaces (`#FFFFFF`).
- **Strict Separation of Status Channels:** JAT Validation Status (`Approved` / `Accepted`, `Waiting Confirmation`, `Rejected` / `Declined`) strictly reflects internal LMS evidence compliance and is visually and semantically separated from external employer recruitment stages (BR-28).
- **Explicit Mock/Assistive Disclosure:** Any OCR/IDP extraction indicators in the UI are assistive human-review aids and must be labeled as simulated (`Demo / Mock Extraction Assistant`) in the prototype (BR-18, BR-26, BR-37).

---

## 2. Design Tokens (Retrieved from Stitch Theme & HTML Exports)

### 2.1 Color Palette & Semantic Tokens

```yaml
colors:
  # Brand & Primary Hierarchy
  primary: '#006878'                 # Deep Teal (text/icons on light tint, high-contrast brand anchor)
  on-primary: '#FFFFFF'
  primary-container: '#0BB1CB'       # Primary CTA fill, active nav indicator, progress ring stroke
  on-primary-container: '#003E49'
  brand-accent-teal: '#00A5B5'       # Student portal accent & secondary brand touchpoint
  brand-accent-sky: '#0EA5E9'
  primary-fixed: '#A7EEFF'
  primary-fixed-dim: '#52D7F2'

  # Secondary & Tertiary
  secondary: '#356570'
  on-secondary: '#FFFFFF'
  secondary-container: '#B7E8F4'
  on-secondary-container: '#3A6974'
  tertiary: '#496809'
  on-tertiary: '#FFFFFF'
  tertiary-container: '#8AAD4C'
  on-tertiary-container: '#293E00'

  # Surfaces & Backgrounds
  background: '#F9F9FF'
  surface: '#F9F9FF'
  surface-canvas: '#F8FAFC'          # Primary app viewport background wash (slate-50)
  surface-subtle: '#F1F5F9'          # Table headers, muted bars, secondary button hover (slate-100)
  surface-card: '#FFFFFF'            # Base cards, tables, drawers, modal dialogs
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F0F3FF'
  surface-container: '#E7EEFF'
  surface-container-high: '#DEE8FF'
  surface-container-highest: '#D8E3FB'
  inverse-surface: '#263143'
  inverse-on-surface: '#ECF1FF'

  # Typography & Neutrals
  text-primary: '#1E293B'            # Headings, primary cell data, strong labels (slate-800 / #0F172A)
  text-secondary: '#475569'          # Standard body copy, secondary cells, form labels (slate-600)
  text-muted: '#64748B'              # Timestamps, placeholders, helper text, inactive icons (slate-500)

  # Borders & Dividers
  border-subtle: '#E2E8F0'           # 1px structural card/table borders (slate-200)
  border-strong: '#CBD5E1'           # Input hover/focus boundaries, elevated popovers (slate-300)
  outline: '#6D797D'
  outline-variant: '#BCC9CC'

  # Semantic Validation Status Triad
  status-accepted-bg: '#ECFDF5'      # Approved / Accepted / Target Achieved (emerald-50)
  status-accepted-border: '#10B981'  # (emerald-500 / #A7F3D0 in light border variants)
  status-accepted-text: '#047857'    # (emerald-700 / #065F46)

  status-waiting-bg: '#FFFBEB'       # Waiting Confirmation / Needs Reminder (amber-50 / #FEF3C7)
  status-waiting-border: '#F59E0B'   # (amber-500 / #FDE68A)
  status-waiting-text: '#B45309'     # (amber-700 / #92400E)

  status-declined-bg: '#FEF2F2'      # Rejected / Declined / Not Achieved (rose-50 / #FEE2E2)
  status-declined-border: '#EF4444'  # (red-500 / #FECDD3)
  status-declined-text: '#B91C1C'    # (red-700 / #991B1B)

  # System Error
  error: '#BA1A1A'
  on-error: '#FFFFFF'
  error-container: '#FFDAD6'
  on-error-container: '#93000A'
```

### 2.2 Typography Scale

- **Font Family:** `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif`
- **Icon Font (Used in Stitch HTML Exports):** Google `Material Symbols Outlined` (`wght 100..700`) and inline Feather/Heroicon-style SVGs.

| Token Name | Size | Weight | Line Height | Letter Spacing | Primary Usage |
|---|---|---|---|---|---|
| `display-lg` | `32px` (`2rem`) | `700` (Bold) | `40px` | `-0.02em` | Hero metrics, large numeric counters |
| `headline-lg` | `24px` (`1.5rem`) | `700` (Bold) | `32px` | `-0.015em` | Desktop page headers (`Job Application Tracking`, `Konfirmasi Request JAT`) |
| `headline-lg-mobile` | `20px` (`1.25rem`) | `700` (Bold) | `28px` | `-0.01em` | Mobile page headers, large modal titles |
| `headline-md` | `18px` (`1.125rem`) | `600` (SemiBold) | `26px` | `-0.01em` | Section headers (`Phase 1`, `Student Participant on This Batch`, Drawer headers) |
| `title-md` | `16px` (`1rem`) | `600` (SemiBold) | `24px` | `0` | Card titles, brand title, dialog titles |
| `title-sm` | `14px` (`0.875rem`) | `600` (SemiBold) | `20px` | `0` | Table primary cell values (Student name, Company), form section titles, button labels |
| `body-lg` | `15px` (`0.9375rem`) | `400` (Regular) | `24px` | `0` | Modal body descriptions, callout copy |
| `body-md` | `14px` (`0.875rem`) | `400` (Regular) | `20px` | `0` | Standard table cells, text inputs, select options |
| `label-md` | `13px` (`0.8125rem`) | `600` (SemiBold) | `16px` | `0.01em` | Form field labels, compact buttons, filter chips |
| `body-sm` | `12px` (`0.75rem`) | `400` (Regular) | `18px` | `0` | Timestamps, secondary metadata, field helper descriptions |
| `label-sm` | `11px` (`0.6875rem`) | `700` (Bold) | `14px` | `0.02em` | Status badges, uppercase table column headers (`BATCH`, `PHASE`, `STATUS`), micro tags |

### 2.3 Spacing, Grid & Border Radius

- **Base Grid:** 8pt spatial rhythm with 4pt half-steps.
- **Spacing Scale:**
  - `space-xs`: `0.25rem` (`4px`) — inline icon-text gaps, micro badge padding
  - `space-sm`: `0.5rem` (`8px`) — tight vertical stacks, button groups
  - `space-md`: `0.75rem` (`12px`) — form field vertical spacing, compact cell padding
  - `space-lg` / `gutter` / `margin`: `1rem` (`16px`) — standard card padding, grid column gap
  - `space-xl` / `gutter-lg` / `margin-md`: `1.5rem` (`24px`) — desktop outer page padding, drawer padding, section spacing
  - `space-2xl` / `margin-lg`: `2rem` (`32px`) — major layout block separation
  - `space-3xl`: `2.5rem` (`40px`) — bottom page breathing room
- **Border Radius (`ROUND_EIGHT`):**
  - `sm`: `0.25rem` (`4px`)
  - `DEFAULT` / `lg` (in Stitch Tailwind config): `0.5rem` (`8px`) — standard buttons, text inputs, selects, action icon buttons
  - `md` / `xl`: `0.75rem` (`12px`) — cards, table containers, alert banners, popovers
  - `2xl`: `1rem` (`16px`) — modal dialogs, major dashboard containers
  - `full`: `9999px` — status indicator pills, tab switchers, circular avatars, radio/toggle pills

### 2.4 Elevation & Depth

- **Canvas Base (`#F8FAFC`):** Flat foundational background plane.
- **Card Tier 1 (`#FFFFFF`):** `1px solid #E2E8F0` (`border-subtle`) with subtle ambient shadow `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)` (`shadow-sm`).
- **Floating Popovers & Filter Menus:** `1px solid #CBD5E1` (`border-strong`) with elevated shadow `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` (`shadow-xl`).
- **Modal & Drawer Backdrops:** `#0F172A` at 40%–60% opacity with blur (`bg-slate-900/40 backdrop-blur-sm` or `backdrop-blur-md`).
- **Slide-Over Drawers:** Left border `1px solid #E2E8F0` with lateral shadow `-8px 0 24px -4px rgba(15, 23, 42, 0.12)` (`shadow-2xl`).

---

## 3. Layout & Navigation Architecture

### 3.1 App Shell Structure
- **Persistent Left Sidebar (`256px` / `w-64` in HTML exports; `240px` in DESIGN.md):**
  - **Student Portal Shell:** Displays Dibimbing logo + `Student Portal` badge. Navigation items include `Dashboard`, `Materi`, `Test`, `Project`, `Tata Tertib`, `Modul`, **`Talent Support`** (expanded submenu with `Layanan Talent Support`, **`Job Application Tracking`** [active], `Recording Practice`, `Job Connector`), `Connection`, `Pre-Assessment`. Footer contains Light/Dark mode pill toggle.
  - **Admin Portal Shell:** Displays Dibimbing logo + `TALENT ADMIN` badge. Grouped under `Main Menu` (`Dashboard`, `Admission`, `Bootcamp`, `Payment Mentor`) and `Talent & Career` (`All Bootcamp Student`, `Talent Support`, `All Hiring Partner`, `Talent Recommend`, `Student Job Preference`, **`Job Application Tracking`** [active], `Job Portal`). Footer displays logged-in Admin card (`Admin Dibimbing`, `talent@dibimbing.id`).
  - *Constraint Note (AGENTS.md):* Unrelated LMS navigation items shown in the shell are static chrome for context only; do not build unrelated LMS features.
- **Sticky Top Utility Header (`h-16` / `64px` on Admin, `h-20` / `80px` on Student):**
  - Left: Back navigation chevron + Cohort/Context title (or global search bar on Admin).
  - Right: Global search input, notification bell with badge dot, and user profile avatar + role label.
- **Main Content Area:**
  - Offset by sidebar width (`ml-64` / `pl-64`) on desktop (`>=1024px`), fluid width up to `max-w-7xl` (`1280px`–`1440px`), padded with `24px`–`32px` (`px-space-xl` / `p-8`).

### 3.2 Admin Top-Level Sub-Navigation
- On Admin JAT screens (`Admin - JAT Batch Management` and `Admin - JAT Request Queue`), a top-level pill tab switcher or breadcrumb header allows switching between:
  1. **`Daftar Batch JAT`** (Batch & Participant Management)
  2. **`Request`** (HITL Waiting Confirmation Queue, with numeric pending counter badge)

---

## 4. Reusable Component Specifications

### 4.1 Buttons & Action Controls
- **Primary CTA Button:** `bg-[#0BB1CB] hover:bg-[#0997AD] text-white font-semibold rounded-lg px-5 py-2.5 shadow-sm active:scale-95 transition-all`. Used for `+ Add Proof of Application`, `+ Buat Batch Baru`, `+ Tambah Student`, `Submit Bukti Lamaran`, `Konfirmasi JAT`.
- **Secondary / Outline Button:** `bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#1E293B] font-semibold rounded-lg px-4 py-2.5 transition-colors`. Used for `Batal`, `Cancel`, `Filter`, `Export Riwayat (CSV)`.
- **Destructive Button:**
  - Solid (Modal confirm): `bg-[#DC2626] hover:bg-red-700 text-white font-semibold rounded-lg px-5 py-2.5`.
  - Subtle (Trigger): `bg-[#FEF2F2] text-[#B91C1C] border border-[#EF4444]/30 hover:bg-rose-100 rounded-lg px-4 py-2`.
- **Row Action Icon Buttons (`32x32px` / `w-8 h-8`):**
  - Inspect / View Detail: `rounded-lg bg-surface-subtle hover:bg-primary-container/20 text-primary` with `visibility` (eye) icon.
  - Delete / Remove: `rounded-lg bg-surface-subtle hover:bg-status-declined-bg text-text-muted hover:text-status-declined-text` with `delete` or `person_remove` icon.
  - Locked Action: `lock` icon in `text-slate-300` when deletion is disallowed (e.g., once status is `Approved` / `Accepted`).

### 4.2 Dual-Channel Status & Progress Badges
All status pills use `rounded-full px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 border`:
1. **Validation Status (Submission Level):**
   - `Approved` / `Accepted`: Emerald theme (`#ECFDF5` bg, `#047857` text, `#10B981` border) + checkmark/dot.
   - `Waiting Confirmation`: Amber theme (`#FFFBEB` bg, `#B45309` text, `#F59E0B` border) + pulsing dot or `hourglass_top` icon.
   - `Rejected` / `Declined`: Rose theme (`#FEF2F2` bg, `#B91C1C` text, `#EF4444` border) + `cancel`/dot icon + optional `"Lihat Alasan →"` link.
   - *Terminology Note:* Stitch screens use `Accepted`/`Declined` on some Student views and `Approved`/`Rejected` on Admin views and PRD/Business Rules. See Section 6 (Open Questions) and normalize in a single status mapper component.
2. **Phase & Date Range Target Status:**
   - `Achieved` / `Tercapai` / `On Track`: Emerald badge.
   - `Not Achieved` / `Tidak Tercapai`: Rose badge.
   - `In Progress` / `Sedang Berjalan` / `Needs Reminder`: Cyan or Amber badge.
   - `Not Started` / `Belum Dimulai` / `Upcoming`: Neutral Slate badge (`#F1F5F9` bg, `#475569` text, `#E2E8F0` border).

### 4.3 Data Tables, Filters & Pagination
- **Table Header:** `bg-[#F1F5F9]` (`surface-subtle`), height `44px`–`48px`, `11px`–`12px` uppercase bold labels (`#475569`), optional sort indicators (`↕`).
- **Table Rows:** `bg-white border-b border-[#E2E8F0] hover:bg-[#F8FAFC]`, vertical padding `12px`–`16px`.
- **Bulk Selection Bar (Admin Request Queue):**
  - Checkbox column on left (`select-all-checkbox` in `<thead>`, `.row-select-checkbox` on each `<tr>`).
  - Selected rows highlight with `bg-primary-container/10`.
  - When `selectedCount > 0`, displays contextual toolbar above table showing count (`N data terpilih`) and bulk actions (`Batal`, `Tolak Terpilih`, `Konfirmasi Terpilih`).
- **Filter Popover:** Anchored dropdown panel (`w-80` to `w-96`, `rounded-xl bg-white shadow-xl border border-[#CBD5E1] p-4`) with select dropdowns for `Batch`, `Phase`, `Date Range`, `Job Level`, or `Status`, plus `Reset` and `Terapkan Filter` / `Apply Filter` buttons.
- **Pagination Footer:** Displays page size selector (`Show: 10 Data`), summary text (`Menampilkan X dari Y Data`), and page navigation pills (active page in `#0BB1CB` with white text).

### 4.4 Forms & File Upload Dropzone
- **Input & Select Controls:** Height `40px`–`44px` (`h-10` / `h-11`), `px-3.5`, `bg-[#F8FAFC]` (`surface-canvas`), `border border-[#E2E8F0]`, `rounded-lg`. Focus state shifts background to `#FFFFFF` with `ring-2 ring-[#0BB1CB] border-[#0BB1CB]`.
- **Labels & Validation:** Persistent `<label>` above input with red asterisk `<span class="text-rose-500">*</span>` for required fields, and `10px`–`11px` helper or validation error message below.
- **Proof Upload Dropzone:** `rounded-xl p-5 bg-[#E6F7F9]/30 hover:bg-[#E6F7F9]/60 border-2 border-dashed border-[#0BB1CB]/60 hover:border-[#0BB1CB] text-center cursor-pointer`. Displays `cloud_upload` icon, accepted formats (`JPG, JPEG, PNG — Maks. 5MB`), and an active uploaded file pill preview (`filename.png · 1.8 MB` with remove `✕` button).

### 4.5 Slide-Over Drawers, Split Inspectors & Modals
- **Student Add Proof Drawer (`580px` width):** Fixed right slide-over (`fixed top-0 right-0 w-[580px] max-w-full h-screen z-50 bg-white shadow-2xl flex flex-col justify-between`). Sticky header, scrollable 2-column form body with requirements info banner, sticky footer (`Batal` + `Submit Bukti Lamaran`).
- **Student Application Detail Drawer (`560px` / `max-w-xl` width):** Right slide-over showing validation status callout banner (with reviewer reason when `Declined`/`Rejected`, or review timestamp when `Accepted`/`Approved`), 2-column read-only job attribute cards, clickable `Link Job Vacancy`, evidence image preview container, and footer actions (`Delete Submission` if `Waiting Confirmation`, `Done`).
- **Admin HITL Evidence Review & Inspector (`max-w-5xl` centered modal or split inspector):**
  - Top batch context bar (`Batch`, `Phase`, `Date Range`).
  - 12-column split layout:
    - **Left (7 cols):** `Data Form Pelaporan Mahasiswa` (2-column grid of all submitted fields: Nama Student, Date Applied + date-window check badge, Company, Location, Role, Job Level, Position, Work System, Years of Experience, Link Job Vacancy, and Attachment download tile).
    - **Right (5 cols):** `Evidence Inspector` (uploaded screenshot preview with zoom badge, rule verification checklist comparing Student Name, Company, Role, Date Window, and `Demo Extraction Assistant — Human Review Required` amber banner).
  - **Bottom Decision Card:** *"Apakah request JAT ini valid?"* with toggle buttons `Iya` (Green `#0BB178`) and `Tidak` (Red `#DC2626`). Selecting `Tidak` reveals mandatory textarea: *"Berikan alasan mengapa request JAT ini tidak valid \*"* (`Minimal 10 karakter`).
  - **Sticky Footer:** `Batal` and `Konfirmasi JAT` / `Tolak Request`.
- **Confirmation Modals (`max-w-md` / `440px`–`480px`):** Centered overlay (`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm`) used for:
  - Student Delete Proof Confirmation
  - Admin Save & Activate Batch Confirmation
  - Admin Remove Student from Batch Confirmation
  - Admin HITL Approve Confirmation

---

## 5. Implementation Guidance for Phase A Prototype

1. **Do Not Use Raw HTML Exports Directly as Production Pages:**
   - The 23 HTML files exported in `design-reference/stitch/html/` contain duplicated shell markup, inline `<script>` tags, and slight token variations across generations (e.g., sidebar width `w-64` vs `240px`, status labels `Accepted`/`Declined` vs `Approved`/`Rejected`).
   - Reconstruct them into clean, modular React + TypeScript + Tailwind CSS components (`AppShell`, `StatusBadge`, `DataTable`, `FilterPopover`, `SlideOverDrawer`, `ConfirmDialog`, `PhaseProgressCard`).
2. **Mock Data & Service Adapter Isolation:**
   - Keep synthetic student, batch, application, and simulated IDP extraction fixtures in a dedicated `mock/` layer behind typed repository/service interfaces (`AGENTS.md`, `System-Requirements.md`).
   - Always render the explicit disclosure badge (`Demo / Mock Extraction Assistant — Visual Preview Only`) wherever simulated OCR/IDP checks appear (BR-37).
3. **Accessibility & Interaction Requirements:**
   - Maintain keyboard navigation (`Escape` to close drawers/modals, focus trapping inside active modals, visible `focus-visible:ring-2 focus-visible:ring-[#0BB1CB]`).
   - Associate all `<label>` elements with form controls via `htmlFor`/`id` and expose validation errors via `aria-invalid` and `aria-describedby`.

---

## 6. Confirmed Product & Design Decisions (`DSN-TBD-01` – `DSN-TBD-06`)

All initial design-to-requirement discrepancies identified during the Stitch design audit have been resolved and confirmed by the Product Owner / User:

| ID | Topic | Confirmed Decision |
|---|---|---|
| **DSN-TBD-01** | **Validation Status Terminology** | **Confirmed:** Standardize all UI validation status badges across both Student and Admin portals to **`Approved`**, **`Rejected`**, and **`Waiting Confirmation`** (replacing `Accepted` / `Declined` labels in Stitch Student mocks). |
| **DSN-TBD-02** | **Recalculate Progress Role Permission** | **Confirmed:** Both **`Admin` (Talent Support)** and **`Super Admin`** have identical authority in JAT and can execute **`Recalculate Progress`**. |
| **DSN-TBD-03** | **Bulk Actions on `Waiting Confirmation` Queue (`9df4e619`)** | **Confirmed:** **Remove the bulk action toolbar** (`Konfirmasi Terpilih` / `Tolak Terpilih` and row selection checkboxes) from the Request Queue. Admin must review submissions individually via the **HITL Evidence Inspector** and provide a mandatory rejection reason whenever changing `Waiting Confirmation` to `Rejected`. |
| **DSN-TBD-04** | **Out-of-Range `Date Applied` Input vs Auto-`Rejected` Status (`BR-14` & `BR-45`)** | **Confirmed:** Students are allowed to submit a `Date Applied` outside the active Date Range (do not block submission via hard datepicker `min`/`max` locks on past dates), and the system must automatically assign validation status **`Rejected`** (`BR-45`). Future dates remain disallowed (`BR-13`). |
| **DSN-TBD-05** | **Batch Deletion Confirmation Modal (`JAT-BL-16` & `BR-09`)** | **Confirmed:** Include a **`Delete Batch`** action on Admin Batch Detail / Batch Management that opens a destructive confirmation modal requiring the Admin to type the **exact batch name** before deletion is enabled. |
| **DSN-TBD-06** | **Per-Attribute IDP Comparison Checklist in HITL Inspector (`BR-39` & `BR-40`)** | **Confirmed:** The HITL Evidence Inspector right-hand checklist must display individual comparison statuses for **all 7 required attributes** from `BR-39` (`Date Applied`, `Role`, `Company`, `Location`, `Position`, `Job Level`, `Work System`) rather than a 4-item summary. |

