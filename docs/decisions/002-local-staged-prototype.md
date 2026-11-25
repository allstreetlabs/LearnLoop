# ADR 002 — local staged-learning prototype

Accepted for local build by Sam's November 24, 2026 instruction. Hosting remains pending approval.

## Decision

Build the first slice in the now-confirmed `allstreetlabs/LearnLoop` repo. Use the 24 authored data-center-flow items for personal practice. Preserve the original review pack and explicit source scopes. Add draft choice checks as a separate authoring layer.

Use Review → Choice → interleaved Repeat → production Recall. This replaces the earlier free-response-only scope. Reading and recognition never count as recalled knowledge and never advance FSRS. The starter set has manually authored choices; manual and imported notes skip choice generation. Self-check free responses against 1–3 ideas; no semantic AI scoring.

Use a portable Node 24/SQLite service and responsive buildless PWA with IndexedDB outbox. This is a local validation slice of the selected hosted architecture, rather than browser-local progress that would later need replacing. It cannot provide actual Android access before an approved host/access step.

Pin tested ts-fsrs 5.2.3 / FSRS-6. Keep the scheduling adapter separate. Do not adopt the newer major version mid-build without checking API, migration and replay behavior. No tiny-history parameter training.

## Follow-up direction from Sam

An ASL subdomain, regular learning use, and sharing with a few friends should guide the next iteration. Prepare an invitation-only pilot with shared learning sets and private per-user progress. This is a product direction, not hosting approval. The current one-owner loopback session endpoint must be replaced before exposure. Do not provision a subdomain, deploy, spend or invite anyone from this build lane without the separate authorization.

## Consequences

- Low dependency count and durable shared progress now; no infrastructure commitment.
- Recognition content and client usability can be reviewed independently.
- Cosmetic corrections reset learning in this prototype; safer than misclassifying a meaning change.
- Offline availability is restricted to due recall and note capture, reducing merge complexity.
- Private HTTPS access, Android device verification, real authentication, per-user ownership and off-machine recovery are release blockers for the pilot.
- Multi-user functionality, CSV, rich document parsing and automated compilation are outside this first local slice. Future subject areas use the same prompt/source/rubric model.
