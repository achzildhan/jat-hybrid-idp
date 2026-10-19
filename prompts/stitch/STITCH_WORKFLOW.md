# Google Stitch workflow for this project

## Where to run the prompts

Run the prompts in this folder **inside the Google Stitch project chat/design agent**, not in the Antigravity terminal. Open https://stitch.withgoogle.com/, create a new project, then paste prompts from `prompts/stitch/` in numbered order.

## Before the first prompt

1. Have `docs/PRD.md` open so you can paste requirement excerpts if requested. A local folder is not automatically visible to Stitch merely because it exists on your computer.
2. Upload reference PNGs from `design-reference/`. Start with 3-5 images per design pass: Student batch list/detail and form, then Admin batch management/create, then Request list/detail.
3. Use the original Figma frames as visual source of truth if available; these PNGs are exported screenshots from the prior design PDFs and may include cropped slide labels/margins.
4. Keep initial design passes focused on a family of screens. Iterate visually before adding more screens.
5. Ask Stitch to generate linked screens/prototype flows where available. Test them by clicking through, not just by judging the static frames.
6. Ask Stitch for a design system `DESIGN.md`. Review and save/export it into the project root after the design is accepted. This file should describe real decisions made in Stitch, not guessed tokens.
7. When satisfied, export/push the design to Antigravity using the currently available handoff option, or export the generated frontend code and design assets. Follow the export UI in the current Stitch interface.

## Suggested sequence

- `01-project-brief.md`: establish product, actor, scope and visual constraints.
- `02-student-screens.md`: create Student flows.
- `03-admin-screens.md`: create Admin/Talent Support flows.
- `04-hybrid-idp-review.md`: design validation detail and HITL review.
- `05-design-system-and-consistency.md`: refine consistency and request `DESIGN.md`.
- `06-prototype-flow-and-handoff.md`: connect screens and prepare developer handoff.

## Review checklist before handoff

- Is Student flow end-to-end understandable?
- Is Admin able to locate a waiting item and inspect original evidence?
- Are Approved, Rejected, and Waiting Confirmation distinguishable?
- Does the UI show that IDP output is uncertain when evidence is incomplete?
- Are validation status and recruitment progress distinct?
- Are forms, tables, empty/error states, drawers, dialogs and navigation consistent?
- Are unresolved behavior choices documented rather than guessed?
