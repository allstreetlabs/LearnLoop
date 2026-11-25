# LearnLoop build handoff

Updated November 25, 2026. Owner: Sam. Lane: planning/design/engineering. Profile: local build with authorized Git source/status backups. Hosting approval absent.

## Recover first

1. Open https://github.com/allstreetlabs/LearnLoop/tree/build/local-prototype and inspect its live branch state. Local checkout: `C:\Users\studi\Documents\Codex\2026-11-17\you-are-the-learnloop-planning-design\work\LearnLoop`, branch `build/local-prototype`. Read STATUS.md. Sam authorized regular source/backlog/status/continuity Git backups and local refinement on November 25; the first verified remote checkpoint is 017948886a5f1f0d056b0e7cd1a9aee902173bce. Check current local/remote SHA on recovery; later local or remote work may exist. No app deployment is implied.
2. Read `AGENTS.md`, README, `docs/product/brief.md`, `docs/architecture/overview.md`, ADR 002, backlog and verification. The old planning ADR is historical; Sam's latest build and staged-learning instructions supersede its no-build/free-response-only exclusions.
3. Run the local launch helper or `node server.mjs` with Node 24; dependencies are installed in this checkout. A fresh clone needs the pinned dependency installed. Default address `http://127.0.0.1:8830`; default private database `data/learnloop.sqlite`. QA used a separate directory. Do not turn local owner sessions into internet authentication.
4. Recheck AgenticHQ. Search `LearnLoop`; exact ThinkTankItem ID supplied by Sam: `cmwl65dld00014v92tk0dd7rr`. Latest connected-account reads returned `not_found`, correlation `3efe7f26-dd6a-4e0c-9a9c-d61370bd7ac7`; name search returned an empty record list after authentication retry. No project/task/handoff/report was created or claimed linked. Ask the HQ steward to reconcile account/workspace/ID; do not create duplicates on an inconclusive read.

## Source-of-truth and provenance

Sam's current instruction governs direction/approvals. Product repo owns implementation. AgenticHQ owns operational tasks and approvals. Shared-sync owns cross-agent continuity. SAMOS is navigation/provenance, not a task store.

- Shared-sync checkout: sibling `shared-sync`, active master. Initial read this turn refreshed origin to `c5d192cdf1de335634dc68cbe3c91036ad982ed9`; final fast-forward is `22da2011e9137e0234a0eebf8218f022b1278690`. Prior local LearnLoop drafts and append-only November 17 daily entries were saved, remote additions fast-forwarded, and local daily suffix restored. Recovery copies are in the parent work/daily-recovery directory. New build continuity/daily notes remain local, not pushed.
- Procedures: `procedures/project-lane-kickoff-and-chat-recovery.md`, `procedures/repo-boundaries-and-sync-rules.md`, shared README. Product kickoff docs now live here. Operational HQ lineage is explicitly incomplete.
- SAMOS checked revision `c7f052de01f3c3108d77a3f3fac3ce4ed08467fe`: AGENTS, START_HERE, SOURCE_MAP, GOVERNANCE, IMPROVEMENT_LANE and PROJECT_REGISTRY. No LearnLoop navigation entry found at the checked revision. No SAMOS task or runtime readiness inferred.
- Initial Ziggy specification: https://github.com/allstreetlabs/allstreetlabs-shared/blob/3f5f13d/projects/learnloop-spec.md. Optional compiler path, not a build dependency. The personal brief and staged flow here supersede its commercial/120-item emphasis.
- Planning packet: sibling shared-sync `projects/learnloop/`, original mockup under `design/`. No Drive project source, Codex Sources registration, published HQ lineage, domain, deployed runtime or host credentials established by this build.

## Locked direction

Android/Chrome priority; usable PC; shared library/progress per learner. First set teaches normal data-center project flow, roles, dependencies and interacting systems, not live-project intelligence. Real projects may illustrate. First 24 items plus sources, not a commercial course pipeline. Source scopes/corrections visible, short calm sessions, recognition distinct from production recall.

Sam approved a local prototype using the 24 candidates on November 24, adding Review → choice → repetition → entered/aloud answers and checking. The original pack is retained unchanged; its old `activation_allowed:false` represents the earlier authoring-review stage, not a ban overriding Sam's new instruction. It has not gained expert certification. Choice checks are new draft content to review separately.

Latest direction: ASL subdomain, regular personal learning and a few friends. Prepare an invitation-only pilot with shareable sets and private per-person progress. This does not authorize deployment, infrastructure, money, invitations or jobs. Keep that approval separate.

Sam further clarified that he will actively use and personalize LearnLoop, build sets on his own subjects, and bring friends/Facebook friends into the pilot as it evolves. A subscription or a feature attached to another product is an option after use demonstrates value; a useful personal system is already a successful outcome. Read Decision 003 and LL-N00 before the next build. No subscription, integration or public growth machinery should displace the personal learning workflow.

Additional exploratory directions are recorded in `docs/product/future-opportunities.md`: Avala and Intel Hub / Talent Network training modules, Google/other personal sign-in, optional shareable profiles/follows, friend knowledge challenges/rankings/levels and eventual downloadable phone distribution. None is an implemented connection or expanded build authorization. Account identity, private progress and shared content need separate boundaries; social/competitive features should be optional and distinguish practice activity from delayed recall.

## Current 0.2 milestone

Multiple learning sets, create/select-set flows, set-specific manual authoring and explicit relational per-profile storage are implemented. Migration preserves all 24 IDs, content/history/schedules, local sessions and dedupe ledger; before-migration SQLite recovery and failed-migration rollback are tested. Local development profiles demonstrate separate progress and owner-scoped APIs, not real Google sign-in or shared-device security. Eighteen automated tests pass. Browser checks observed new-set authoring and switching into/out of independent local profiles. API backup/restore passes; the browser download adapter stalled again and actual file completion/restore remains unverified. See ADR 004 and verification details.

Sam explicitly authorized normal source/doc pushes, regular continuity and use of D: for local work. Daily heartbeat `back-up-learnloop-continuity` is ACTIVE at 11 p.m. Central local time, requiring the app/computer/permissions available. It maintains reviewed state/backups, not recurring product implementation. Private checkpoints: D:\Codex\LearnLoop\backups; isolated tests/rehearsals: D:\Codex\LearnLoop\tests. Pre-migration checkpoint 2026-11-25T08-56-58-298Z-b498141f and restore rehearsal restore-rehearsal-8FIvq5 passed integrity/preservation checks. Browser QA used D:\Codex\LearnLoop\tests\browser-v02; never use its test profiles as Sam's normal library. Verify current normal-library migration and final checkpoint status in STATUS.md/closeout.

## Historical 0.1 local milestone

24-item responsive PWA; review/choice/interleaved-repeat/free-response flow; pinned FSRS; required-idea self-check; due queue and daily caps; persistent SQLite shared library; sources and revisions; note capture/manual items; offline due recall/outbox; explicit conflicts; content JSON import and full JSON backup/atomic restore. Twelve automated tests plus syntax checks pass. Browser walkthrough covered core learning, two storage origins, offline reload/recovery and note conversion. See verification for exact limits and final safeguards not browser-regressed. Browser backup download automation stalled; do not report that path tested.

## Next concrete action

Run the current local build and use it to learn/create sets. Finish a manual file download → preview → restore smoke test and same-origin offline tabs, using a method that does not repeat the stalled browser download-event adapter. Sam reviews choice distractors and actual Android usability. Prepare a concrete ASL-subdomain pilot plan: exact host/domain/runtime, real sign-in/invitation flow, per-user authorization, shared-set correction policy, off-machine recovery, cost and rollback. Approval is the final step before provisioning/deployment; never expose local profile selection as internet identity.

Useful later: content-only CSV exchange, richer capture, cosmetic corrections, verified optional Ziggy import. Deferred: public signup, billing/certification, Playspace dependency, semantic grading, audio, autonomous jobs, rich extraction/OCR.

## Closeout rules

At a material milestone update STATUS.md, feature backlog, product docs, shared continuity and the Chicago daily entry. Commit reviewed authorized source/docs, push the working branch normally and verify the remote SHA. This source-backup permission supersedes the original no-push rule; it does not authorize hosting/deployment. Never push learner/runtime data or credentials. Read docs/operations/continuity-and-backups.md. Recheck remote/HQ state on recovery; no substitute operational records were created for unresolved HQ auth/lookup. Keep current source archives/launch notes in outputs and private database copies only in ignored data/ or the dedicated D: tree.
