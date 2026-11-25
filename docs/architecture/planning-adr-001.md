# LearnLoop architecture decision

ADR 001 revised · November 17, 2026 · Android/Chrome and shared progress confirmed; proposed architecture awaits build/hosting approval

Sam has confirmed Android/Chrome as the primary surface, PC usability, and one shared library/progress history. Recommend a small authenticated hosted app, responsive PWA interface, and offline practice copy on the device. The earlier Windows-localhost, one-device starting assumption is superseded. This decision authorizes no implementation, provider signup, infrastructure or deployment.

## Alternatives

| Option | First usable slice | Benefits | Costs and constraints | Decision |
| --- | --- | --- | --- | --- |
| Local-first browser app | Phone-accessible static HTTPS app; IndexedDB, cached shell, backup files | No learner-data backend; offline practice; content stays on the chosen device | Separate browser data and manual transfer do not meet Sam's shared-progress requirement | Retained alternative, not selected |
| Simple hosted personal app | Small authenticated HTTPS app/database, one user, cached read/practice copy | Same library and progress on phone and PC; central recovery path | Hosting/auth/access/restore need approval; offline grading needs an outbox, idempotency and conflict rules | Recommended for the confirmed requirements |
| Later Playspace build | Integrate only after runtime, data storage, identity, backups and deployment ownership are verified | Could reuse infrastructure and common operations if actually available | Readiness, isolation, cost, ownership, backup recovery and offline behavior have not been established for LearnLoop | Defer; no v1 dependency |

No Playspace provision, domain, database, service, or deployment is assumed ready. A move there needs evidence of the available runtime, data isolation, access model, operating owner, backup restore, cost, and rollback. Reuse the portable model; avoid building against hypothetical APIs.

## Phone access and implementation boundary

Use a small TypeScript web client and one authenticated server/API, following the eventual product repo's conventions. A single-process service with SQLite on persistent storage is sufficient for the initial one-user design; transactionally serialize review acceptance and verify database backup/restore before durable use. Do not use an ephemeral deployment filesystem as the database. Keep SQL/storage and scheduler interfaces explicit. Persist downloaded practice records and pending events in IndexedDB; cache static app assets through a service worker. [Google's PWA storage guidance](https://web.dev/learn/pwa/offline-data) distinguishes these device storage choices.

The original Next.js plus `better-sqlite3` proposal can fit the hosted server, but a PWA cache does not make its SQLite database available offline. Offline practice still needs device records and an outbox. Pin exact framework/library versions at build time; no stack or host is provisioned by this plan.

A Windows localhost prototype can validate components but is not the first usable phone deliverable. Android/Chrome needs an approved HTTPS access path; this plan provisions none. Service-worker use requires a secure context, and installation behavior varies by platform. See [Google's service-worker guidance](https://web.dev/learn/pwa/service-workers) and [installation guidance](https://web.dev/learn/pwa/installation). Test browser and installed/home-screen behavior on Sam's actual Android phone, recording Android and Chrome versions. Do not expose a PC service or introduce a tunnel without approval.

Use one private server database, a device cache and explicit pending-sync state; the server owns accepted review ordering. One preconfigured owner identity is enough: no public registration, organizations or account-management product. Authorize every library/API operation for that owner and protect mutations against cross-site requests. Do not expose learner records through static public assets. No CDN runtime assets, analytics, external fonts, or model APIs are required. Updates must not reload a review mid-attempt; migrate data transactionally and export before schema changes.

## Shared progress contract

Include one-user authentication and authorization, library IDs, device IDs and idempotent attempt IDs. Offline reviews enter an outbox and remain visibly pending until acknowledged. A revision includes its base revision ID. Concurrent edits never silently overwrite each other: show a conflict and require a reviewed resolution. Repeated delivery of one attempt creates one event. Two genuinely separate attempts both remain in history.

Keep the first version narrow: online source/item editing, offline capture as an unactivated draft, and offline practice of downloaded current items. A practice batch carries its base review-state version. If another device advanced that item while offline, preserve both attempts, show a conflict and pause the item. In resolution, show both histories, retain both events, choose the authoritative accepted schedule or reset to relearning, and record the resolution event. A source correction invalidating an offline item similarly prevents its pending grade from silently scheduling the new revision. Reconnect retries, expired authentication and an unavailable backend must not discard local attempts. Restore is a coordinated library replacement, not an unreviewed merge. No CRDT or full offline authoring engine is needed.

## Practical logical model

| Record | Important fields and rule |
| --- | --- |
| Subject | UUID, name, createdAt, archivedAt. One default General subject; no required hierarchy. |
| Source | UUID, kind (`personal_note`, `note`, `article`, `report`), title, optional URL, currentRevisionId. A bookmark may have no excerpt and cannot support an active item yet. |
| SourceRevision | UUID, sourceId, version label, capturedAt, optional source date, saved text/excerpt, content hash. Immutable local evidence snapshot; no automatic fetch or verification claim. |
| Item | UUID, subjectId, currentRevisionId, status (`draft`, `active`, `needs_review`, `suspended`, `archived`), optional tags. Status controls queue eligibility. |
| ItemRevision | UUID, itemId, revision number, free-response prompt, answer, required-points array, optional explanation, claim type, optional as-of date and units, source references, content hash, reviewer, reviewedAt, change reason, supersedesRevisionId. A text scenario is a prompt, not a separate engine. |
| Source reference | Embedded in the item revision: sourceRevisionId, locator such as section/page/line range, and the exact supporting excerpt. One primary reference suffices; an array permits later comparisons without a claim database. |
| ReviewEvent | UUID, attemptId, itemRevisionId, reviewedAt UTC, timezone, rating, recall method, optional missed-point IDs, elapsed time, before/after state, scheduler/config version. Append-only; undo uses a separate marker rather than erasing history. |
| ReviewState | ItemId and active revision, dueAt UTC, scheduler state, stability, difficulty, lapse/repetition counts, lastReviewAt, lastEventId. Updated with the event in one transaction; rebuildable from history and revision resets. |
| Settings | Schema version, selected timezone, new-item daily limit, scheduler configuration, lastExportInitiatedAt. A download initiation is not proof of a successfully stored off-device backup. |

Shared storage adds `libraryId` to owned records, a small Device record, monotonic server revision/cursor, client outbox, accepted-at timestamp and explicit Conflict/Resolution records. The server validates item revision and base scheduling version before one atomic event/state/cursor commit. Daily new-item caps use one library timezone across devices and the union of committed and locally pending introductions, not two independent quotas; offline introductions are deferred in v1 to keep that rule simple. Accepted events produce the same FSRS state on each device; local provisional due dates are labeled pending.

For manual facts, create a personal-note source revision and preserve the learner's wording. Label it unverified rather than fabricating a citation. Mark estimates/inferences explicitly. Require an as-of date where an answer depends on time. Keep rubric point IDs stable within a revision so misses have meaning. Save typed attempts only as local in-progress drafts and clear them after grading; default review history stores outcomes, not an archive of personal prose.

Do not create a canonical extracted-claims service for 30 items. Optional imported claim IDs can remain provenance metadata. Stable UUIDs, revisions and source references are enough for additional subject areas. Commercial tenancy, entitlements and billing have no place in this model yet.

## Scheduling policy

Use an FSRS library through an adapter, with a pinned tested package/model version and stored configuration. The [current ts-fsrs documentation](https://github.com/open-spaced-repetition/ts-fsrs) distinguishes package and model versions and documents four review ratings; do not copy an older API example into a new build without checking compatibility. Start with library defaults and proposed desired retention of 0.90; train no parameters on a tiny personal history. Treat predicted recall as an internal estimate, not measured mastery.

- **Again:** wrong, missing a required point, guessed, needed a hint, or no answer. **Hard:** all required points retrieved, with substantial effort. **Good:** correct with ordinary effort. **Easy:** complete and immediate. Do not encode partial correctness as Hard.
- First exposure is learning, not successful retrieval. Schedule its first attempt through the library's learning policy. After an Again, offer one later retry when at least two other prompts have intervened; if the session ends, the item remains due. Never repeatedly hammer one failed prompt in an immediate loop.
- Due/relearning items first, ordered by due timestamp with subject mixing where possible. Then up to three new items per chosen local calendar day, only if there is no due backlog. Default session: five minutes or ten distinct prompts; optional retries may add attempts. Stop never writes a success.
- One production schedule per item. No recognition track, mandatory confidence tap, or fixed 70/20/10 allocation. An optional unscheduled practice visit does not advance the due date in v1.
- Count a lapse after an established successful recall when Again occurs; count qualifying lapse dates separately. At four separate-date lapses, pause for prompt repair. Never count the same session's retries as four lapses.
- Store UTC instants and the timezone used for a review. Timezone changes alter day labels and daily caps, not past timestamps. A materially backward system clock asks for correction before scheduling; resume supports a long absence without manufacturing missed events.

## Import export and backup

Two contracts avoid confusing content with recovery. **Content import** accepts prompts and provenance only, stages everything as drafts, and has no authority to set the learner's grades. **Full backup** includes all sources, revisions, review events/state, settings and a versioned manifest. Preserve IDs. Include export timestamp, app/schema/scheduler versions, record counts, and per-section hashes for corruption checks. Hashes do not authenticate a publisher.

For both, validate size, schema, references and hashes before a single write; show counts/conflicts in preview. Identical imported IDs/hashes are skipped. Changed items produce reviewed revisions. Unsupported modes are listed rather than silently translated. Reject future backup versions with an actionable message. Restore into an isolated test library first. Replacing the shared library requires a recovery export, explicit confirmation and atomic replacement: pause writes, snapshot/export server state and revalidate other device caches before resuming. Never silently merge restored history with concurrent reviews.

Provide a minimal CSV exchange for prompt, answer, required points, subject, source title/URL/locator and claim type; imported rows are drafts and CSV does not preserve progress or full revision history. JSON is the fidelity-preserving path. Text/Markdown capture and CSV/JSON exchange do not imply PDF parsing, OCR or URL extraction.

Offer full export after the first session, after substantial imports, and when the last initiated export is more than seven days old. This is an in-app suggestion, not a scheduled job. On phone, support Save to Files or the browser's supported download/share path, with a plain file-input restore; verify on the actual device. Sam chooses a private destination and may keep an independent second copy. Do not infer backup completion from a share-sheet opening. A hosted version additionally needs an approved server-backup and restore procedure before durable use; no new backup job is authorized here.

Browser storage may be best-effort and can be cleared; persistent storage requests are browser-dependent and do not replace exported recovery files. [MDN's storage guidance](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) explains the distinction. Show storage persistence status in Data, keep study screens quiet, and never imply local storage is encrypted by the app. Imported text renders as text; links accept safe HTTP/HTTPS schemes and open only on request. No secrets belong in packs or Git.

## Revisit triggers

Android/Chrome and shared progress are confirmed. Select the private host/access method and authentication implementation in a concrete deploy plan for approval. Reopen architecture for large documents/media, a native package, or expanded backup requirements. Playspace and Ziggy remain optional, independently approved paths.
