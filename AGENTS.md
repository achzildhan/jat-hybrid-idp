# Project Instructions — JAT Hybrid IDP

## Project context
This workspace is a new, standalone project created from an empty folder. It is a prototype and development workspace for a Job Application Tracking (JAT) experience informed by the requirements in `docs/` and visual references in `design-reference/`. It is not the source code or production environment of Dibimbing.id.

## Sources of truth
1. `docs/PRD.md` is the functional product requirement source.
2. `docs/Business-Rules.md` is the source for explicit business constraints.
3. `docs/System-Requirements.md` records non-functional requirements and proposed architecture decisions.
4. `docs/Product-Backlog.md` tracks proposed implementation work. Story points and sprint mapping are provisional until a real team confirms them.
5. `design-reference/` contains exported visual references. The approved Stitch design and `DESIGN.md` (when generated) define the current visual direction.
6. When sources conflict, do not silently choose. Report the conflict and ask for a decision.

## Workflow constraints
- Start by reading relevant files and stating the scope of the requested task.
- Work on one screen, feature, or epic at a time.
- Before a wide refactor or adding dependencies, explain why and identify the expected file changes.
- Never overwrite the design system or approved screens without explicit instruction.
- Do not attempt to access an existing Dibimbing.id repository; this project intentionally starts from zero.
- Prototype frontend interactions using synthetic mock data until API contracts are approved.
- Keep mock data isolated from real service adapters so integration can replace it later.
- Do not invent endpoints, database schema names, API response fields, provider/model versions, or production credentials.
- If a required decision is unknown, mark it as `TBD` and ask instead of fabricating a fact.

## Design instructions
- Follow the approved Stitch screens and design tokens; if `DESIGN.md` is exported, use it as the design system source.
- Rebuild the visual reference as native reusable UI elements. Never place the entire reference screenshot as a page background.
- Maintain consistent navigation, type scale, spacing, tables, forms, status indicators, drawers and dialogs.
- Support Student and Admin/Talent Support experiences separately.
- Use accessible labels, keyboard interactions, focus states, semantic controls and responsive layouts.
- Do not add unrelated LMS features or new navigation areas without approval.

## Product/business constraints
- Main actors: Student and Admin/Talent Support (Admin actions follow explicit role permissions).
- Validation status is `Approved`, `Rejected`, or `Waiting Confirmation`.
- Validation status is distinct from recruitment progress/status.
- Allowed proof image types are JPG, JPEG, PNG.
- Date Applied cannot be in the future or outside the currently allowed JAT date range.
- A complete form does not prove that evidence is sufficient.
- Cropped, irrelevant, incomplete, unreadable or ambiguous proof must never receive automatic approval solely because submitted form values are complete.
- An explicit mismatch on a required field must not be ignored.
- Uncertain cases go to human review according to approved decision rules.
- The LLM is an assistive component; deterministic rules for file format, dates, permissions and data integrity take precedence.
- Do not claim vacancy open/closed status unless reliable evidence or an approved data source supports it.

## Engineering and safety
- Keep secrets out of source control. Use environment variables or the project's approved secret manager.
- Never paste real student personal information or production screenshots into external services without authorization.
- Treat OCR and LLM outputs as untrusted inputs; validate schema and values before storage or use.
- Do not store raw chain-of-thought. Store concise, evidence-grounded outcomes and reasons where appropriate.
- Use clear error states, loading states and empty states.
- Add/update tests for behavior changes and run relevant tests before reporting completion.
- Report actual command outputs; never fabricate successful tests, performance data or UAT.
- Do not claim release/deployment unless actual release evidence exists.
- Do not build UML diagrams. Use process flows, component architecture, data-flow diagrams and traceability tables when necessary.

## Expected completion report
For each task, report: files changed, behavior added, PRD/business rules addressed, tests actually run/results, assumptions/TBDs, and how to verify manually.
