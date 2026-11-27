# LearnLoop build handoff

## Continuity maintenance — November 26, 11 p.m. Central

The daily maintenance check fetched origin and found the clean C: mirror two commits behind the already reviewed/pushed D: recovery milestone. Refreshed this same working branch by fast-forward only to d59a868; no branch merge, app execution or private-data migration. The ignored primary SQLite file's SHA256 was unchanged across the refresh. D:/Codex/LearnLoop/work/release-prep-20261126T180131025Z remains the active engineering checkout; this C: location is now a synchronized source mirror, rather than the older 7a8a9ec checkout described in the historical closeout.

C: now reports about 6.1 GB free, superseding the prior zero-space observation. This maintenance run did not open Chrome or verify Google setup; browser, provider and actual-device acceptance remain pending. No tests were rerun for this source-mirror/documentation-only maintenance, and no new runtime backup was needed because no learner data changed. Existing private checkpoint and 43-test evidence remain dated above. The daily automation's path guidance was aligned with the active D: checkout; its continuity-only scope and schedule remain unchanged.

## Local recovery and workstation blocker — November 26

Sam authorized continuing the next useful local build/test/preparation steps on D:. C: was observed with zero free bytes; Chrome reported FILE_ERROR_NO_SPACE and browser control could not continue the Google setup. Default terminal sandbox launch also failed, but read-only/authorized D: commands work through the escalated terminal path. No unrelated files were deleted or moved. Google OAuth client/consent creation and live deployment were not performed.

Active writable engineering checkout is D:/Codex/LearnLoop/work/release-prep-20261126T180131025Z on build/local-prototype, cloned without hardlinks from the prior clean 7a8a9ec source. The original C: checkout and learner data remain in place; do not blindly copy its older source over D: or claim it contains subsequent commits. Review remote SHA on recovery. QA logs/temp databases are under D:/Codex/LearnLoop/tests/release-prep-2026-11-26, never the primary library.

Built a local non-overwriting SQLite recovery-preparation command, new normalized checkpoint output and a recovery runbook. It validates trusted digest/schema/integrity, retains all content/progress/identity/dedupe tables, clears all saved sessions/unfinished sign-ins, and requires a new directory outside the release. Windows suite now has 43 passing tests plus syntax checks. No new browser/Android/Linux or real provider acceptance was possible in this pass. Local restore rehearsal/checkpoint receipts accompany closeout. Off-machine recovery destination/job and deployment approval remain open.

## Dedicated project created; working name retained — November 26

Sam explicitly authorized creating a separate Google Cloud project using the already signed-in ASL account. Created after visible-project duplicate search; live IAM verifies the administrator's Owner (Legacy) role, and Billing shows no linked account. Exact account/project identifiers and URLs are in ignored data/deployment/google-project.json; screenshot is in the parent outputs/learnloop-google-project-created.jpg. No OAuth client/secret/consent, billing, deployment or additional permission grant was created. This supersedes the earlier read-only administrator-check limitation below. Next provider step is the dedicated Web client and consent configuration, followed by real callback/device acceptance; server/recovery deployment remains a separate approval.

Sam also directed that LearnLoop stay a provisional code/project name because existing learning products use it. Focused live research confirmed overlap. See product/naming.md and LL-NAME-01 in backlog. Keep the selected neutral learn.allstreetlabs.com address; no new name/domain or migration was selected. Future branding changes must preserve learning IDs, progress and backup compatibility. No product code/data changed in this milestone; prior test evidence is unchanged.

## Historical administrator account check — November 26

Live read-only Google Cloud console confirmed the intended existing administrator account is signed in and an existing HQ-related project is visible. Exact address/project are recorded only in ignored data/deployment/google-admin-check.json, not this public repo. This verifies session/account access, not IAM Owner role or project-creation permission. No LearnLoop project, OAuth client, consent settings or deployment was created. Continue with the dedicated-project/Web-client recommendation after the relevant setup approval.

## Provider project consultation — November 26

At Sam's explicit request, consulted AgenticHQ (A) Build about reusing existing sign-in setup. Recommendation: retain direct Google OIDC, use an existing ASL administrator account to own a dedicated LearnLoop Google Cloud project and a new Web OAuth client. A shared Auth0 application is an alternative only if Sam chooses ASL SSO. The builder's findings are recorded evidence, not fresh provider inspection. See operations/google-project-choice.md. No provider configuration/credential or deployment changes; private account ownership details remain outside Git.

## Two private accounts prepared — November 26

Sam supplied a primary Google sign-in email and requested a second account for independent profile testing. Actual addresses and owner mappings are only in ignored data/deployment/google-accounts.json; do not copy them into Git. Primary maps to the existing local-owner library. Secondary maps to a newly created independent owner with its own 24-item starter library and no events. Existing primary library hash is unchanged; integrity/foreign keys pass. Configuration was validated through the real hosted resolver with in-process fictional credentials, without starting hosted mode or enrolling any Google identity. A pre-profile SQLite checkpoint and a separate private invitation-config backup were verified/saved under D:/Codex/LearnLoop/backups; a post-change checkpoint follows the source milestone. Load the private JSON as the eventual LEARNLOOP_GOOGLE_ACCOUNTS value, not as a filename. Google client/provider setup, callback and deployment remain unapproved/unexecuted. No new app code or test suite change; prior 38-test evidence is dated November 25.

## Current 0.4 build — Google identity and hosted security

Local implementation/testing authorized by Sam's “ok lets go”; provider/server deployment hold remains. New lib/config.mjs, google.mjs and auth.mjs implement explicit hosted mode, signed Google OIDC identity, one-time browser-bound state/PKCE/nonce, immutable issuer+subject ownership, private invitation→existing-library mapping, separate hashed sessions, logout, canonical loopback proxy/origin checks and bounded rate limits. No public profile/session creation in hosted mode. Normal PC launch remains local.

The private LEARNLOOP_GOOGLE_ACCOUNTS JSON allowlist is required (empty fails), alongside Google client credentials/origin. Use one sub OR authoritative email and existing ownerId per entry. Do not commit real account values. Map Sam to local-owner to preserve the existing library; initial third-party email needs a stable subject pin. First hosted open creates a private pre-auth SQLite snapshot and auth tables without changing library schema 2. Learning JSON backups omit auth/session tables; full SQLite recovery must revoke hosted_sessions/oauth_transactions before returning online.

Client verifies owner before opening cache online; offline boot is opt-in for a personal device, expiry-bound and denied after remembered auth failure. Sign-out explicitly clears saved drafts/cache after pending work syncs and locks other tabs. Private browser caches are not encryption. Read ADR 006 and verification for the final guards not fully browser-regressed.

38 tests pass on Windows and local Ubuntu/Node 24.22.3, syntax checks pass and package advisory audit reports no known vulnerabilities. Browser signed-fictional-identity QA observed login, learning, opted-in offline boot/note outbox/reconnect, other-tab logout, retained progress and opt-out offline lock. No actual Google/Caddy/HTTPS/device acceptance. Test helper is loopback-only and never imported by production. All previews stopped.

Next: obtain Sam's first account/private Google project setup, finish provider/branding + late client smoke, select/verify off-machine recovery and exact deployment artifact. Runtime Linux24.22.3 digest is pinned in deploy/asl-hq/runtime.json; not installed on HQ. The reviewed server/provider/backup changes still need explicit final approval. DNS learn→162.35.191.47 is already verified. Latest HQ item read still not_found, correlation5ae073e0-52de-4cbf-a664-ef9e83fa5158; no duplicate records created.


## DNS completed by Sam — November 25

Sam reported adding the GoDaddy record. Independent read-only checks against ns73.domaincontrol.com, ns74.domaincontrol.com and 1.1.1.1 all returned learn.allstreetlabs.com A = 162.35.191.47, TTL 3600. DNS is complete at this observation; earlier absent-record/held-DNS statements below are historical. This is not TLS, Google login or app-deployment acceptance. No agent DNS/server/provider changes made; prior deployment/provider approval boundaries remain. Next engineering gate is hosted identity/security implementation and tests, followed by the reviewed deployment/recovery approval package.

## Selected HQ release plan — November 25

Sam selected learn.allstreetlabs.com, Google login and ASL HQ; DNS/provider/server deployment changes remain unapproved. See docs/operations/asl-hq-deployment-plan.md and review-only deploy/asl-hq/ templates. Public HQ A and current inventory agree on 162.35.191.47; learn has no A/AAAA. Strict IP-pinned, non-sudo read-only SSH confirmed asl-hq, Caddy 2.11.3 active, system Node 18.19.1, about 4 GiB available RAM/90 GiB disk and free loopback 8830. Dedicated Node 24 is proposed; never upgrade HQ's global runtime for this app. Current 0.3 lacks hosted identity/security and cannot be deployed as-is. Old SSH alias/procedures point to retired IP; no keys/aliases/config changed. HQ exact item still not_found, latest correlation 011ad9cc-196f-45f0-8bce-c105c6dfd4e8; no duplicate record. No DNS, OAuth, runtime, service, proxy, backup job or learner-data changes executed.

## Historical initial phone/PC proposal — November 25

Sam asked what is needed for an ASL subdomain and suggested learn.allstreetlabs.com. See docs/operations/hosted-personal-pilot.md: same-origin persistent Node/SQLite, Google sign-in proposed for Sam first, hosted request/security boundary, preserved library, HTTPS/DNS, off-machine recovery and real Android/PC acceptance. Public DNS currently has GoDaddy nameservers and no learn record. Product branch was verified at ed1efac before this documentation update; shared origin/master fetched at ebfa903. No host has been inspected/selected, no infrastructure or provider changes authorized/executed. HQ item still not_found after one authentication retry; preserve unresolved lineage without duplicating records.

## Current handoff — 0.3 research and refinement

Start with STATUS.md and the live branch SHA, not the historical 0.2 closeout reference below. New instruction authorized local refinement and a research pass on learning apps/methods. Research: docs/research/2026-11-25-learning-methods-and-app-review.md; decision: ADR 005. Source/data foundations stay the same; no hosting, new service, dependency or SQL migration.

Built: optional authored fill-the-gap and process-ordering practice, three explicit-install source-linked examples in a separate set, bounded personal pace/recall-first preferences with concurrent-save protection, clearer Today returns/pending/paused/allowance states, shorter actionable practice landing, and JSON view/paste preview/restore. Extra-practice history never changes production schedules, versions or delayed-recall counts, and never stores typed answers. Corrections retain unchanged source scopes/secondary references/context while adding immutable revisions and resetting learning. New backups are schema 3; prior 1/2 accepted.

Twenty-eight tests plus syntax checks pass. Browser checks observed examples, both formats, keyboard ordering, format correction/authoring, preferences, recall-first, upcoming return, offline pending/reconnect and full pasted-JSON restore. See verification for precise widths and limits. Native file saving/chooser/clipboard copy and actual Android remain open. QA data is D:/Codex/LearnLoop/tests/browser-v03; do not copy it into the normal library or Git. Owned preview stopped. Final source/remote SHA and private checkpoint receipt are delivered outside Git to avoid self-referential hashes; verify current state.

Next: Sam tries Today and Practice on the local PC, reviews original choice content and the three optional derived examples independently from usability. Test the actual phone after approved HTTPS hosting; current loopback cannot be reached from Android. Finish native save/chooser and multi-tab/accessibility smoke checks, then select a small equal-time delayed-recall trial. Do not contaminate the control with overlapping mode examples. Consider quick-capture friction and safe grade undo before more modes.

No HQ task/approval linkage was established: supplied ID was not found and later connected searches repeatedly requested authentication. Keep that as a reconciliation task; do not create a duplicate project. Shared-sync/SAMOS pointers below are checked historical revisions, not claims of current remote state.


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

## Historical 0.2 milestone

Multiple learning sets, create/select-set flows, set-specific manual authoring and explicit relational per-profile storage are implemented. Migration preserves all 24 IDs, content/history/schedules, local sessions and dedupe ledger; before-migration SQLite recovery and failed-migration rollback are tested. Local development profiles demonstrate separate progress and owner-scoped APIs, not real Google sign-in or shared-device security. Eighteen automated tests pass. Browser checks observed new-set authoring and switching into/out of independent local profiles. API backup/restore passes; the browser download adapter stalled again and actual file completion/restore remains unverified. See ADR 004 and verification details.

Sam explicitly authorized normal source/doc pushes, regular continuity and use of D: for local work. Daily heartbeat `back-up-learnloop-continuity` is ACTIVE at 11 p.m. Central local time, requiring the app/computer/permissions available. It maintains reviewed state/backups, not recurring product implementation. Private checkpoints: D:\Codex\LearnLoop\backups; isolated tests/rehearsals: D:\Codex\LearnLoop\tests. Pre-migration checkpoint 2026-11-25T08-56-58-298Z-b498141f and restore rehearsal restore-rehearsal-8FIvq5 passed integrity/preservation checks. Browser QA used D:\Codex\LearnLoop\tests\browser-v02; never use its test profiles as Sam's normal library. Verify current normal-library migration and final checkpoint status in STATUS.md/closeout.

Closeout: 0.2 implementation commit 5f2fc3735d84cadad25db8827a9643cd855135da pushed/read back. The normal library migrated with full legacy-field preservation, 24 items/one set/zero learning events and clean integrity/foreign keys. Standard launch smoke passed. Post-migration D: checkpoint 2026-11-25T18-36-59-878Z-e4e1fbe5 verified. Owned servers stopped; no app deployment. Subsequent closeout documentation commits may follow; read live branch SHA rather than treating this implementation reference as the final head.

## Historical 0.1 local milestone

24-item responsive PWA; review/choice/interleaved-repeat/free-response flow; pinned FSRS; required-idea self-check; due queue and daily caps; persistent SQLite shared library; sources and revisions; note capture/manual items; offline due recall/outbox; explicit conflicts; content JSON import and full JSON backup/atomic restore. Twelve automated tests plus syntax checks pass. Browser walkthrough covered core learning, two storage origins, offline reload/recovery and note conversion. See verification for exact limits and final safeguards not browser-regressed. Browser backup download automation stalled; do not report that path tested.

## Prior 0.2 next-action record

Run the current local build and use it to learn/create sets. Finish a manual file download → preview → restore smoke test and same-origin offline tabs, using a method that does not repeat the stalled browser download-event adapter. Sam reviews choice distractors and actual Android usability. Prepare a concrete ASL-subdomain pilot plan: exact host/domain/runtime, real sign-in/invitation flow, per-user authorization, shared-set correction policy, off-machine recovery, cost and rollback. Approval is the final step before provisioning/deployment; never expose local profile selection as internet identity.

Useful later: content-only CSV exchange, richer capture, cosmetic corrections, verified optional Ziggy import. Deferred: public signup, billing/certification, Playspace dependency, semantic grading, audio, autonomous jobs, rich extraction/OCR.

## Closeout rules

At a material milestone update STATUS.md, feature backlog, product docs, shared continuity and the Chicago daily entry. Commit reviewed authorized source/docs, push the working branch normally and verify the remote SHA. This source-backup permission supersedes the original no-push rule; it does not authorize hosting/deployment. Never push learner/runtime data or credentials. Read docs/operations/continuity-and-backups.md. Recheck remote/HQ state on recovery; no substitute operational records were created for unresolved HQ auth/lookup. Keep current source archives/launch notes in outputs and private database copies only in ignored data/ or the dedicated D: tree.

## Recovery rehearsal closeout — November 26

Implementation cd36ff01222e56287d3667c8563f4b255a67dc89 was normally pushed and independently read back from origin/build/local-prototype. New private checkpoint D:/Codex/LearnLoop/backups/2026-11-26T18-06-50-999Z-9ac2a6f8 contains its verified source bundle plus self-contained SQLite and manifest. Actual CLI recovery into D:/Codex/LearnLoop/tests/release-prep-2026-11-26/normal-library-recovery-180712930 preserved both owners, 48 total items, 26 total sources and zero learning events; cleared two local sessions; integrity/foreign keys passed. Source checksum matched its trusted manifest afterward. The active primary database was never replaced or used for QA mutations. The fixture tests separately prove preservation of nonempty scheduled recall history and immutable hosted identities while clearing hosted sessions/flows.

The initial Git fetch failed; retrying the authorized push with TEMP/TMP redirected to D: succeeded. Chrome/Google setup remains blocked by the observed full C: drive. No new provider credentials/consent, live Google callback, browser-guard smoke, Android test, Linux rerun or HQ deployment was claimed. No preview server was started. Final documentation may follow the implementation SHA; inspect the live branch. Current writable checkout is the D: path above; C: checkout remains at 7a8a9ec and should be refreshed only after disk space is restored, preserving its ignored private data.
