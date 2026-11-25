# Architecture as built

November 24–25, 2026 · personal local prototype · one owner

The [planning ADR](planning-adr-001.md) remains an historical recommendation. Sam authorized a local build on November 24 and added staged review/choice/repetition before free recall. This supersedes that ADR's no-build state and exclusion of recognition. Hosting is still a separate gate; the eventual target is a small ASL subdomain pilot with a few friends.

## Runtime and ownership

Buildless responsive HTML/CSS/JavaScript PWA → same-origin Node 24 ESM HTTP API → local SQLite using Node's built-in `node:sqlite`. Plain JavaScript avoids an extra compilation/bundling dependency in this small first slice. Server scheduling is isolated in `lib/domain.mjs`, using pinned `ts-fsrs@5.2.3`, FSRS-6, default weights, 0.90 desired retention, fuzz disabled. Package 6 exists; this prototype intentionally pins the tested stable 5.2.3 API and records that exact scheduler version in every recall event and backup. No model training or semantic marking.

SQLite stores a versioned library document, an idempotency ledger, and hashed local session tokens. Writes are serialized in `BEGIN IMMEDIATE` transactions under WAL with synchronous FULL. Library document replacement and action acceptance occur in the same transaction. This compact storage choice is adequate for one owner and 24 items; typed prose is excluded. Split into relational tables once multi-owner access, larger libraries or query volume justify it. The portable data model is independent of the storage layout.

All learner APIs require the local owner cookie. Every mutation checks JSON content type and exact origin; Host is loopback-only, no CORS, static files come from an explicit allowlist, source URLs allow HTTP/HTTPS only, and user content renders as escaped text. No public signup, external fonts, tracking or API secrets. Loopback session creation is deliberately unsuitable for remote hosting. Do not expose it through a proxy or subdomain.

## Records

- Library: schema, restore epoch, revision, timestamps, shared timezone/new-item limit/scheduler configuration.
- Source: stable ID, title, link, version, checked date, scope and optional saved excerpt. Edits append a new source rather than rewriting the old evidence record.
- Item: stable ID, subject, display order, optimistic version, suspended flag, introduction stage, repeat gate, FSRS card, last recall and distinct lapse dates.
- Item revision: immutable prompt, answer, explanation, 1–3 required ideas, source references/locators, claim basis, variation/context, change reason and optional authored choice check. Original 24 IDs preserved. All corrections create a revision and restart learning; cosmetic-only scheduling preservation is deferred.
- Event: UUID/action ID, server sequence/time, device ID, item/revision reference, kind. Choice events hold recognition outcome. Recall events hold method, rating, missed rubric indices, before/after scheduler state and scheduler version. History is append-only.
- Conflict: preserved stale attempted outcome, expected/actual item versions, resolution and timestamp. Resolution keeps the accepted shared schedule or restarts learning. Conflicted outcomes never count as recall successes.
- Captured note draft: title, passage, optional URL and capture time. A separate browser editor draft prevents loss before submission.
- Browser outbox: action UUID, library epoch, device, base item version and outcome. Typed prose is never put in this outbox.

The source and content files retain authoring provenance. Personal notes are visibly unverified. Importing content cannot import grades. Sources are references and optional pasted excerpts, not a web-content compiler or an external monitoring service.

## Learning progression

For starter items: Review → first choice success → repeated choice success → production recall. Failed choice stays at its current stage. After any choice and after a production Again, wait for two distinct other graded items or ten minutes. A transition from repeated choice to recall also waits for this gap. Three shared introductions per calendar day; due production recall first, then introduced checks, then new material. Manual notes/imported prompts without authored choices start at Review and then production recall.

Only production recall invokes FSRS. Hard/Good/Easy require all required points and an attempted answer; missing points, hints/guessing or no answer require Again. Client gating is convenience; the server independently validates outcomes, availability and versions. Four lapse dates after prior successful recall on the current revision suspend an item for repair. Normal same-date retries do not inflate that count. There is no predicted mastery score. The Today count of delayed successes requires at least 24 hours since a prior recall attempt and is descriptive, not experimental evidence.

## Device/offline/sync

Service worker caches only a same-origin asset allowlist, never API responses; a new worker waits instead of reloading an active answer. IndexedDB retains the library cache, drafts and pending actions. Due recall and note capture may queue offline. Introductions, choice checks, editing and file imports/restores require a connection. Pending-item lock prevents double grading in one device copy. No client-side provisional FSRS schedule is invented.

Server accepts each UUID once; reuse with different content fails. Base item versions allow unrelated-item progress and detect same-item races or source corrections. A stale attempt becomes a persisted conflict and pauses eligibility until reviewed. Replaying a duplicate conflict cannot create extra records. A restore changes the library epoch so old pending work cannot silently land on restored content. Device recovery exports and locally retained rejected/set-aside actions support manual reconciliation. No CRDT or background autonomous job.

## Backup and migration

Full JSON backup schema `learnloop.backup/1` includes library, scheduler/config, counts and SHA-256 of the library. The checksum detects accidental corruption; it does not authenticate a publisher. Schema, references and states are validated before mutation. A preview is bound to file hash and current library epoch/revision. Restore requires the literal RESTORE confirmation, saves a pre-restore backup in the private data directory, then atomically replaces the library with a new epoch. Other device caches refresh; stale pending work is retained and explicitly set aside only after recovery export.

Content JSON schema `learnloop.content-review/0.1` imports prompts/provenance as review items and skips identical prompt/answer pairs. It does not round-trip grades or choice variants. CSV, PDF/OCR, web extraction and full offline authoring remain deferred. Browser storage persistence is optional and never replaces portable backups. An approved hosted pilot requires tested off-machine server backups; none were provisioned here.

## Local-first, hosted app, Playspace

| Path | Assessment |
| --- | --- |
| Browser-only local-first | Excellent offline isolation; manual file transfer does not meet shared phone/PC progress. Not selected. |
| Simple hosted personal/pilot app | Selected target: responsive PWA, one persistent server database, real sign-in, invitation-only pilot and per-person histories. Local implementation validates the flow and sync contract; it is not a deployed phone deliverable. |
| Later Playspace | Optional only after runtime, identity, storage, backup/restore, costs and ownership are verified. No dependency or readiness claim. |

For a friend pilot, keep published learning-set revisions reusable, but own each learner's item copies/progress/history by authenticated user. Authorize every read/write by owner; device IDs are never identities. Shared-set correction and personal-note sharing need explicit behavior before enabling them. Keep notes private by default. No billing, commercial packs or certification tenancy is implied.
