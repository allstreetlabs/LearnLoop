# LearnLoop active state

## Continuity maintenance — November 26, 11 p.m. Central

The daily maintenance check fetched origin and found the clean C: mirror two commits behind the already reviewed/pushed D: recovery milestone. Refreshed this same working branch by fast-forward only to d59a868; no branch merge, app execution or private-data migration. The ignored primary SQLite file's SHA256 was unchanged across the refresh. D:/Codex/LearnLoop/work/release-prep-20261126T180131025Z remains the active engineering checkout; this C: location is now a synchronized source mirror, rather than the older 7a8a9ec checkout described in the historical closeout.

C: now reports about 6.1 GB free, superseding the prior zero-space observation. This maintenance run did not open Chrome or verify Google setup; browser, provider and actual-device acceptance remain pending. No tests were rerun for this source-mirror/documentation-only maintenance, and no new runtime backup was needed because no learner data changed. Existing private checkpoint and 43-test evidence remain dated above. The daily automation's path guidance was aligned with the active D: checkout; its continuity-only scope and schedule remain unchanged.

## Local recovery and workstation blocker — November 26

Sam authorized continuing the next useful local build/test/preparation steps on D:. C: was observed with zero free bytes; Chrome reported FILE_ERROR_NO_SPACE and browser control could not continue the Google setup. Default terminal sandbox launch also failed, but read-only/authorized D: commands work through the escalated terminal path. No unrelated files were deleted or moved. Google OAuth client/consent creation and live deployment were not performed.

Active writable engineering checkout is D:/Codex/LearnLoop/work/release-prep-20261126T180131025Z on build/local-prototype, cloned without hardlinks from the prior clean 7a8a9ec source. The original C: checkout and learner data remain in place; do not blindly copy its older source over D: or claim it contains subsequent commits. Review remote SHA on recovery. QA logs/temp databases are under D:/Codex/LearnLoop/tests/release-prep-2026-11-26, never the primary library.

Built a local non-overwriting SQLite recovery-preparation command, new normalized checkpoint output and a recovery runbook. It validates trusted digest/schema/integrity, retains all content/progress/identity/dedupe tables, clears all saved sessions/unfinished sign-ins, and requires a new directory outside the release. Windows suite now has 43 passing tests plus syntax checks. No new browser/Android/Linux or real provider acceptance was possible in this pass. Local restore rehearsal/checkpoint receipts accompany closeout. Off-machine recovery destination/job and deployment approval remain open.

Updated November 26, 2026 · owner Sam · local build lane

## Current milestone

**November 26 provider milestone:** Sam explicitly authorized a separate Google Cloud project using the signed-in ASL account. The dedicated project was created after checking for an existing visible LearnLoop project; IAM confirms the intended administrator's Owner (Legacy) role and Billing confirms no linked billing account. Private identifiers/evidence are in ignored data/deployment/google-project.json. OAuth client/credentials and consent setup remain pending; no billing, host deployment or new job was configured. This narrowly supersedes earlier statements that no project creation was authorized/executed.

**Working name:** Sam accepts LearnLoop as a code/project name and may choose a more distinctive public brand. Live checks found overlapping learning products; see docs/product/naming.md. Naming review precedes wider promotion, not the personal prototype. No repo/domain/data rename was made.

**0.4.0 Google identity and hosted-security implementation built/tested locally.** Includes one-time state/PKCE/nonce, signed identity validation, private invitation→existing-library mapping, separate hosted sessions, owner isolation, hosted profile-picker removal, canonical HTTPS proxy/origin checks, rate limits, health/readiness and sign-out/device-cache controls. Default PC launch stays local. Original24 items, sources, learning history and schema 2 are preserved; auth tables are created only in hosted mode after a private snapshot.

**38 tests pass on Windows and local Ubuntu/Node 24.22.3**, plus syntax checks. Dependency audit reports no known vulnerabilities at this check. Browser uses a fictional signed-identity fixture: login, review, opted-in offline reopen/note sync, other-tab sign-out, retained progress and opt-out offline lock observed. Final persisted-denial/in-flight guards were source/syntax/helper checked after walkthrough; later client smoke remains. This is not a live Google/TLS/HQ acceptance or independent security audit.

## Status and next gate

| Area | State / next gate |
| --- | --- |
| Personal learning / formats / pace / JSON recovery | Implemented through 0.3, preserved and regressed in 0.4 |
| Hosted Google identity / private ownership | Built/tested locally; two user-selected account mappings prepared in ignored private configuration. Primary library preserved; second independent local profile created. Google client/consent/branding, live callback and deployment remain pending |
| Device privacy / offline | Opt-in personal-device reopening, expiry/denial gate, explicit clear-device logout; actual HTTPS/Android and final-guard client smoke open |
| ASL hostname / host choice | learn.allstreetlabs.com + ASL HQ selected; user-added A→162.35.191.47 TTL3600 independently verified |
| Runtime / deployment | Node 24.22.3 Linux x64 archive checked against official SHA256 manifest and used only locally; HQ still unmodified |
| Recovery | Pre-auth D: checkpoint verified; final source/private checkpoint at closeout; off-machine destination/restore/job approval open |
| Source/status continuity | Normal branch commit/push/readback at closeout; final receipt in delivered outputs |
| Daily continuity | Existing continuity-only heartbeat; no new jobs created |
| AgenticHQ | Exact item still not_found after auth retry (5ae073e0-52de-4cbf-a664-ef9e83fa5158); no duplicate |
| Friends / social / subscriptions / Avala / Intel / native app | Later candidates, no invitation/integration or commercial work |

November 26: private account mappings are at data/deployment/google-accounts.json (ignored, never commit). The first maps to the existing primary library; the second maps to a separate local profile with its own 24-item starter set and zero events. Primary content/history hash remained unchanged; SQLite integrity/foreign keys pass. Private mapping backup was saved under the dedicated D: backup tree. No live Google enrollment or server changes.

Next: private Google client setup, late client/actual-device smoke, exact off-machine recovery and concrete deployment review. Source/runtime artifact, provider/server/backup changes and acceptance/rollback must be reviewable before final approval. Do not expose local mode or the test fixture on HQ.

Start with README, AGENTS, docs/handoff.md, docs/backlog.md, ADR 006, docs/verification.md and docs/operations/asl-hq-deployment-plan.md. Private runtime data stays ignored under data/; QA stays in isolated D:/Codex/LearnLoop/tests or local Ubuntu /tmp. Normal launch: node server.mjs at 127.0.0.1:8830. All owned previews stopped.

Authorization: local building/testing/refinement, dedicated D: use, normal source/doc backups and existing continuity maintenance; Sam subsequently explicitly authorized the dedicated Google project creation recorded above. DNS was added by Sam. OAuth client/credential/consent setup, host deployment, spend, invitations and new autonomous jobs remain separate pending steps.

## Recovery rehearsal closeout — November 26

Implementation cd36ff01222e56287d3667c8563f4b255a67dc89 was normally pushed and independently read back from origin/build/local-prototype. New private checkpoint D:/Codex/LearnLoop/backups/2026-11-26T18-06-50-999Z-9ac2a6f8 contains its verified source bundle plus self-contained SQLite and manifest. Actual CLI recovery into D:/Codex/LearnLoop/tests/release-prep-2026-11-26/normal-library-recovery-180712930 preserved both owners, 48 total items, 26 total sources and zero learning events; cleared two local sessions; integrity/foreign keys passed. Source checksum matched its trusted manifest afterward. The active primary database was never replaced or used for QA mutations. The fixture tests separately prove preservation of nonempty scheduled recall history and immutable hosted identities while clearing hosted sessions/flows.

The initial Git fetch failed; retrying the authorized push with TEMP/TMP redirected to D: succeeded. Chrome/Google setup remains blocked by the observed full C: drive. No new provider credentials/consent, live Google callback, browser-guard smoke, Android test, Linux rerun or HQ deployment was claimed. No preview server was started. Final documentation may follow the implementation SHA; inspect the live branch. Current writable checkout is the D: path above; C: checkout remains at 7a8a9ec and should be refreshed only after disk space is restored, preserving its ignored private data.
