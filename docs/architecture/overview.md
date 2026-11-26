# Architecture as built

## 0.4 identity and hosted boundary

Default local behavior stays available. Explicit Google mode requires canonical HTTPS origin, private web client credentials and a nonempty LEARNLOOP_GOOGLE_ACCOUNTS JSON allowlist mapping invited subject/authoritative email to existing owner IDs. Production cannot default to local. Data must be absolute and outside the release; runtime must be Node 24. The pre-start guard checks these conditions, not Google network availability.

Pinned jose 6.2.18 validates Google RS256 identities against fixed Google JWKS/token endpoints. State/verifier/nonce are ten-minute, browser-bound, consumed before exchange. Immutable Google issuer+sub binds each existing library once; initial email enrollment requires Gmail/verified Workspace. Hosted auth tables/sessions are separate from local profile cookies. First hosted open takes a private consistent SQLite snapshot. Library content schema 2 and learning backup 3 remain compatible; public JSON backups include no identity/session/credential data.

Canonical Host, HTTPS forwarded protocol and exact mutation Origin are required from a loopback proxy only. Caddy overwrites X-Forwarded-For with the direct client address. Bounded rate limits, timeouts, HSTS, host-only Secure/HttpOnly/Lax cookies and safe errors complement existing owner/epoch/version checks. Local session/profile endpoints are unavailable remotely.

The client opens online cache only after identity selection. Offline reopening is opt-in, owner/expiry-bound and prevented by a persisted authentication denial. In-flight responses from an earlier account generation are discarded. Sign-out revokes its session, clears origin cache/storage and locks tabs; pending work must sync before that explicit UI action. Cache is private browser storage, not encrypted protection against OS/browser control. Offline clients cannot observe revocation until reconnecting.

Auth bindings require private SQLite disaster recovery; revoke all restored hosted sessions and OAuth transactions before release. Learning JSON restore affects only the authenticated library, preserving owner identity. Read ADR 006 and verification for exact tests/limits. No server/provider deployment has occurred.


## 0.3 refinement

Library/SQL schema remains 2. Optional session minutes, attempt cap, introduction preference and optimistic settingsVersion extend the existing metadata; absent values keep defaults. Bounds: 0–10 new ideas/day, 3–15 minutes, 3–20 attempts, guided or recall-first. Recall-first affects future Review transitions only; sessions stop between questions. Stale settings return a conflict without an event or overwrite; the client retains a draft for explicit review/resave. These controls do not tune FSRS parameters.

Immutable content revisions optionally hold a single cloze gap with aliases, or 3–8 process steps with a required question; both support a hint. public/learning.js shares pure format/preference validation with the server; public/screens.js renders escaped view fragments. Matching is deterministic on the client, not semantic grading. Extra-practice events record kind, matched/review/revealed, hint-used and an explicit non-recall measure; no typed answer is sent. They change neither FSRS, stage, item version, repeat gates nor daily introductions. A scheduling-version change alone does not invalidate unscheduled practice; a changed content revision creates a preserved conflict.

The three-example pack installs only on an explicit action into a separate set and deduplicates without overwriting edits. It overlaps original material. Corrections preserve unchanged primary source identity/scope, secondary references and section/variation context, while appending a personal revision and restarting learning as before.

New backup schema is learnloop.backup/3 with appVersion 0.3.0. Schema 1/2 inputs remain supported. JSON view/copy and pasted-JSON preview/restore use the same validation, destination/epoch/revision binding and RESTORE gate as files. The attachment route additionally checks the expected owner against the cookie to prevent a stale profile page exporting another profile. Native file saving is still unverified; pasted restore is browser-observed. Service-worker cache v3 includes the new modules, without API caching or forced reloads.

The unchanged foundations and 0.2 migration below still apply; references to fixed pace or backup/2 describe the previous defaults/format. See ADR 005 for current decisions.


November 25, 2026 · local prototype 0.3 · profile-owned learning sets

The [planning ADR](planning-adr-001.md) remains an historical recommendation. Sam authorized a local build on November 24 and added staged review/choice/repetition before free recall. This supersedes that ADR's no-build state and exclusion of recognition. Hosting is still a separate gate; the eventual target is a small ASL subdomain pilot with a few friends.

## Runtime and ownership

Buildless responsive HTML/CSS/JavaScript PWA → same-origin Node 24 ESM HTTP API → local SQLite using Node's built-in `node:sqlite`. Plain JavaScript avoids an extra compilation/bundling dependency in this small first slice. Server scheduling is isolated in `lib/domain.mjs`, using pinned `ts-fsrs@5.2.3`, FSRS-6, default weights, 0.90 desired retention, fuzz disabled. Package 6 exists; this prototype intentionally pins the tested stable 5.2.3 API and records that exact scheduler version in every recall event and backup. No model training or semantic marking.

SQLite now stores explicit users, profile metadata, learning sets, sources, items, immutable revisions, source locators, progress, review events, drafts, conflicts, accepted actions and hashed local sessions. Composite owner keys and foreign keys enforce set/item ownership. `lib/storage.mjs` projects one owner's relational rows into the portable domain library; a transaction replaces only that owner's rows and accepts the action atomically. WAL and synchronous FULL remain enabled. This is adequate for the small local pilot foundation; row-level incremental writes can replace whole-owner projection writes if scale requires them. Raw typed attempts remain device-local.

All private learner APIs require a cookie-bound profile. The session chooses ownership; request owner IDs cannot select a different library. A public loopback-only profile-name picker/session endpoint supports local development testing, so this is not real identity or protection against another person controlling the computer. Every mutation checks JSON content type and exact origin; Host is loopback-only, no CORS, static files use an allowlist, links accept HTTP/HTTPS only, and user content renders as escaped text. No public signup, external fonts, tracking or API secrets. Replace local profile/session selection before remote hosting; do not expose it through a proxy or subdomain.

## Records

- User/local profile: stable app-owned ID and display name; provider sign-in remains unimplemented. Each profile has its own library, content and progress.
- Library: schema 2, owner ID, restore epoch, revision, timestamps, per-profile timezone/new-item limit/scheduler configuration.
- Learning set: stable ID, owner, title, description and creation time. Set selection filters practice/library; daily introductions remain capped across all sets in the profile. Shared-set access grants are a later feature.
- Source: stable ID, title, link, version, checked date, scope and optional saved excerpt. Edits append a new source rather than rewriting the old evidence record.
- Item: stable ID, subject, display order, optimistic version, suspended flag, introduction stage, repeat gate, FSRS card, last recall and distinct lapse dates.
- Item revision: immutable prompt, answer, explanation, 1–3 required ideas, source references/locators, claim basis, variation/context, change reason and optional authored choice check. Original 24 IDs preserved. All corrections create a revision and restart learning; cosmetic-only scheduling preservation is deferred.
- Event: UUID/action ID, server sequence/time, device ID, item/revision reference, kind. Choice events hold recognition outcome. Recall events hold method, rating, missed rubric indices, before/after scheduler state and scheduler version. History is append-only.
- Conflict: preserved stale attempted outcome, expected/actual item versions, resolution and timestamp. Resolution keeps the accepted shared schedule or restarts learning. Conflicted outcomes never count as recall successes.
- Captured note draft: title, passage, optional URL and capture time. A separate browser editor draft prevents loss before submission.
- Browser outbox: action UUID, library epoch, device, base item version and outcome. Typed prose is never put in this outbox.

The source and content files retain authoring provenance. Personal notes are visibly unverified. Importing content cannot import grades. Sources are references and optional pasted excerpts, not a web-content compiler or an external monitoring service.

## Learning progression

For starter items: Review → first choice success → repeated choice success → production recall. Failed choice stays at its current stage. After any choice and after a production Again, wait for two distinct other graded items or ten minutes. A transition from repeated choice to recall also waits for this gap. Three shared introductions per calendar day by default; due production recall first, then introduced checks, then new material. Manual notes/imported prompts without authored choices start at Review and then production recall.

Only production recall invokes FSRS. Hard/Good/Easy require all required points and an attempted answer; missing points, hints/guessing or no answer require Again. Client gating is convenience; the server independently validates outcomes, availability and versions. Four lapse dates after prior successful recall on the current revision suspend an item for repair. Normal same-date retries do not inflate that count. There is no predicted mastery score. The Today count of delayed successes requires at least 24 hours since a prior recall attempt and is descriptive, not experimental evidence.

## Device/offline/sync

Service worker caches only a same-origin asset allowlist, never API responses; a new worker waits instead of reloading an active answer. IndexedDB keys the library cache, selected set, editor/answer drafts, recoveries and pending actions by profile. Legacy device data is copied into the default profile's namespace once, with old keys retained as recovery evidence. Cross-tab pending updates use one read/write transaction. A state response for a different cookie profile is rejected before overwriting this profile's cache; its pending actions remain until the correct local profile is reopened. Due recall, extra practice and note capture may queue offline; introductions, choice checks, edits, profiles/sets and file imports/restores require a connection. Pending-item lock prevents double grading in one device copy. No provisional FSRS schedule is invented.

Server accepts each UUID once; reuse with different content fails. Base item versions allow unrelated-item progress and detect same-item races or source corrections. A stale attempt becomes a persisted conflict and pauses eligibility until reviewed. Replaying a duplicate conflict cannot create extra records. A restore changes the library epoch so old pending work cannot silently land on restored content. Device recovery exports and locally retained rejected/set-aside actions support manual reconciliation. No CRDT or background autonomous job.

## Backup and migration

Full JSON backup schema `learnloop.backup/3` includes one profile's library, scheduler/config, counts and SHA-256. Legacy schema-1 checksums are verified before conversion. The checksum detects corruption, not publisher identity. Schema, references and states are validated before mutation. Preview binds file, mode, import destination and current library epoch/revision. Restore requires RESTORE confirmation, saves a private pre-restore backup and atomically replaces only the current profile, with its own owner ID and a new epoch. Other profiles remain unchanged. Stale pending work is retained for explicit recovery/reconciliation.

Before migrating a legacy database, SQLite's backup API saves `before-schema-2-*.sqlite`. Migration preserves content/history/state, old sessions and action deduplication, retains legacy tables and rolls back normalized tables if validation fails. A private D: source/database checkpoint and independent restore/migration rehearsal preceded normal migration. See ADR 004 and operations/continuity-and-backups.md. A server backup contains accepted records, not unacknowledged browser drafts/outbox entries.

Content JSON schema `learnloop.content-review/0.1` imports prompts/provenance as review items and skips identical prompt/answer pairs. It does not round-trip grades or choice variants. CSV, PDF/OCR, web extraction and full offline authoring remain deferred. Browser storage persistence is optional and never replaces portable backups. An approved hosted pilot requires tested off-machine server backups; none were provisioned here.

## Local-first, hosted app, Playspace

| Path | Assessment |
| --- | --- |
| Browser-only local-first | Excellent offline isolation; manual file transfer does not meet shared phone/PC progress. Not selected. |
| Simple hosted personal/pilot app | Selected target: responsive PWA, one persistent server database, real sign-in, invitation-only pilot and per-person histories. Local implementation validates the flow and sync contract; it is not a deployed phone deliverable. |
| Later Playspace | Optional only after runtime, identity, storage, backup/restore, costs and ownership are verified. No dependency or readiness claim. |

For a friend pilot, keep published learning-set revisions reusable, but own each learner's item copies/progress/history by authenticated user. Authorize every read/write by owner; device IDs are never identities. Shared-set correction and personal-note sharing need explicit behavior before enabling them. Keep notes private by default. No billing, commercial packs or certification tenancy is implied.

Sam's future opportunity register (`../product/future-opportunities.md`) includes Avala and Intel Hub / Talent Network connections, provider sign-in, social profiles/follows/challenges and mobile distribution. Keep app-owned user IDs distinct from login-provider identities, optional shared profiles and any host application's IDs. Reserve integration seams through the separate learning core and versioned data; implement a concrete API/embedding contract only when one host product is selected. No connection, shared identity, access grant or infrastructure readiness is assumed. Practice participation/XP and measured delayed recall must remain distinguishable if levels or rankings are later added.
