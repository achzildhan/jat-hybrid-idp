# Antigravity Prompt 02 — Scaffold frontend prototype

Implement the approved standalone JAT frontend prototype only.

Before coding, confirm that approved Stitch screens and `DESIGN.md` are available. Use the UI design handoff as the visual source of truth. Read `AGENTS.md`, `docs/PRD.md`, `docs/Business-Rules.md`, and `docs/System-Requirements.md`.

Recommended prototype stack (unless an already-created approved scaffold determines otherwise): React + TypeScript + Vite + Tailwind CSS + React Router. If any dependency or version selection is uncertain, explain the decision before installing it.

Build only:
1. app shell and navigation;
2. design tokens/components based on `DESIGN.md`;
3. route/page scaffolding for Student and Admin;
4. shared data types and synthetic mock fixtures;
5. loading, empty, success, error and confirmation states.

Do not create a production backend, database, authentication service, OCR service or LLM service. Do not fabricate APIs. Keep mock fixtures behind a repository/service adapter so a future backend can replace it.

Run the local app and verify the key routes in the browser. Report files changed, commands, test results and missing screens. Stop for review before implementing full workflows.
