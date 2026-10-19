# Antigravity Prompt 04 — Hybrid IDP implementation

Act as a Document Processing / AI Engineer. Begin with a technical assessment, not immediate code changes.

Inspect the actual prototype architecture and produce a proposed integration contract for a Hybrid IDP pipeline. Do not assume an OCR engine, image library, backend language, LLM provider, SDK, or API protocol.

Target concept:
file validation → evidence sufficiency/image checks → preprocessing if required → OCR → structured information extraction → deterministic rule validation → semantic LLM check where appropriate → validation decision → human review for uncertain cases → save result and expose it to JAT.

Critical rules:
- unsupported files and invalid dates are rejected by deterministic application logic, not left to an LLM;
- incomplete/cropped/irrelevant/ambiguous evidence must not be automatically approved;
- explicit mismatch in required fields must not be silently ignored;
- unknown fields remain unknown/null rather than guessed;
- statuses are Approved, Rejected, Waiting Confirmation;
- validation status is separate from recruitment progress;
- no claims about an open/closed job vacancy without reliable approved evidence;
- do not store raw model chain-of-thought;
- keep provider keys in environment/secret management;
- no training/fine-tuning unless separately approved and evaluated.

Deliver first: dependency map, schema proposal, security/privacy risks, provider alternatives (if useful), reproducible evaluation-set plan, and acceptance criteria. Wait for approval before modifying code or using external APIs.
