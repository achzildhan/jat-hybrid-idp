# Stitch Prompt 01 — Project brief and visual direction

Create a coherent web-app design for **Job Application Tracking (JAT)**, a career-support feature conceptually placed inside the Dibimbing.id LMS. This is a new project; do not claim access to an existing product backend. Treat the uploaded design-reference images as the primary visual reference and the PRD summary below as the behavioral source of truth.

## Product context

Two roles use the application:
- Student: view JAT batches, phase/date ranges, targets/progress; submit job application fields and proof image; see validation status and feedback.
- Admin/Talent Support: manage batches, participants, date ranges and targets; inspect Applied Jobs; review Waiting Confirmation submissions; update results according to permission; monitor progress.

The existing reference imagery shows a Dibimbing-style LMS with a left sidebar, a light background, white/soft-gray surfaces, cyan/teal accent elements, dense data tables, phase/progress cards, dialogs and drawers. Use those images to infer the actual visual system. Preserve the overall visual character, hierarchy, density and navigation patterns, but improve readability and consistency where needed. Do not invent exact token values until visually inspected; keep the palette coherent and accessible.

## Global design principles
- Professional education/career SaaS; calm and clear, data-dense but not cluttered.
- Reuse a consistent sidebar/header, spacing, typography, buttons, inputs, status chips, tables, dialogs and drawers.
- Prioritize desktop web layouts, with responsive behavior for smaller screens.
- Follow accessible contrast, focus styles, labels and keyboard-friendly patterns.
- Keep Student and Admin navigation contexts distinct.
- Use synthetic names and data in mock UI.
- Build real component layouts, not full-screen images of the source references.
- No UML, no unrelated LMS features, and no marketing landing page.

## Validation and business context
Validation statuses are Approved, Rejected, and Waiting Confirmation. These are not the same as recruitment progress such as Applied or Interview. Accepted evidence formats for the intended application are JPG, JPEG and PNG. Date Applied cannot be in the future or outside the allowed JAT range. A complete form must not override incomplete/cropped/irrelevant evidence. Uncertain cases should clearly route to human review.

## First task
Before generating every screen, propose a screen map and 1 coherent visual direction. Then create the Student batch-list screen as the initial anchor screen, using the supplied Student batch-list reference image. Keep the flow and visual treatment close to the reference. Wait for review before generating the next screen family.
