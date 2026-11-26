# Verification and limits

## Local recovery and workstation blocker — November 26

Sam authorized continuing the next useful local build/test/preparation steps on D:. C: was observed with zero free bytes; Chrome reported FILE_ERROR_NO_SPACE and browser control could not continue the Google setup. Default terminal sandbox launch also failed, but read-only/authorized D: commands work through the escalated terminal path. No unrelated files were deleted or moved. Google OAuth client/consent creation and live deployment were not performed.

Active writable engineering checkout is D:/Codex/LearnLoop/work/release-prep-20261126T180131025Z on build/local-prototype, cloned without hardlinks from the prior clean 7a8a9ec source. The original C: checkout and learner data remain in place; do not blindly copy its older source over D: or claim it contains subsequent commits. Review remote SHA on recovery. QA logs/temp databases are under D:/Codex/LearnLoop/tests/release-prep-2026-11-26, never the primary library.

Built a local non-overwriting SQLite recovery-preparation command, new normalized checkpoint output and a recovery runbook. It validates trusted digest/schema/integrity, retains all content/progress/identity/dedupe tables, clears all saved sessions/unfinished sign-ins, and requires a new directory outside the release. Windows suite now has 43 passing tests plus syntax checks. No new browser/Android/Linux or real provider acceptance was possible in this pass. Local restore rehearsal/checkpoint receipts accompany closeout. Off-machine recovery destination/job and deployment approval remain open.

## Current 0.4 authentication build — November 25, 2026

38 automated tests pass on Windows/Node 24.22.3 and local Ubuntu as ordinary user studio (UID1000), using isolated native /tmp databases. Windows fixtures use the dedicated D: tests tree. All syntax checks pass; the pinned production dependency audit reports no known vulnerabilities at this check. This is functional/security regression evidence, not an independent security audit or live release acceptance.

New checks exercise real RS256-signed fixture identities through the HTTP endpoints and jose validator: state/cookie binding, one-time consumption, expiry and cancellation; signature/issuer/audience/nonce/authorized-party/email checks; invite denial; stable-subject enrollment and email reassignment refusal; two sessions reconnecting to a byte-equivalent library with a real Good FSRS card/history; cross-owner action/export/restore isolation; legacy-cookie refusal; persistent sessions, allowlist revocation, logout/storage headers; canonical proxy/origin checks, request limits and public health with no learner data. Invalid owner startup rolls back auth tables without changing content. The actual service pre-start command rejects incomplete config or unsafe data paths without printing credentials.

Chrome/Windows phone-sized walkthrough used only test/support/hosted-preview.mjs on localhost:8940 and D:/Codex/LearnLoop/tests/learnloop-hosted-browser-jmPz0W. This fixture signs a fictional QA identity and substitutes the provider navigation locally; it makes no real Google requests and supplies no live credentials. Observed:

- Sign-in page has invitation/privacy explanation and unchecked personal-device offline option; no local profile picker.
- Checked offline consent, completed the fictional identity flow, entered the original 24 library and accepted a review.
- Stopped server, reloaded into the opted-in cache, captured a fictional note offline and saw one pending.
- Restarted the same isolated fixture, reconnected and saw zero pending; prior review and captured note remained.
- A second tab opened the same accepted state. Explicit sign-out returned both tabs to the login screen.
- Signed in again with offline consent left off; prior progress/note were retained. Server-stop/reload showed login rather than the private library.
- Library DOM width and scrollWidth both 375 CSS pixels (requested 390 viewport). Temporary viewport reset; all owned preview processes stopped.

Screenshots outside Git: learnloop-v04-signin-phone.jpg and learnloop-v04-account-phone.jpg. The sign-in status label was subsequently clarified from Offline copy to Sign in. Persisted-denial and in-flight-account generation guards were added after the browser walkthrough, then source/syntax/helper checks were rerun; no second complete browser pass is claimed for those final guards. No native file download/file chooser adapters were used.

The official Node 24.22.3 Linux x64 archive was downloaded and SHA-256 checked against its official HTTPS manifest, then run locally from D:; no HQ runtime installed. Hash: 4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb. Local Linux tests are not real HQ systemd/Caddy/TLS acceptance.

Pre-auth checkpoint: D:/Codex/LearnLoop/backups/2026-11-26T01-15-13-144Z-d330d8e0, source a1d4c1e. Its directory timestamp is UTC; user-facing work date is November 25 Central. Normal local launch/health/assets passed. All 12 content/progress tables remain identical to the checkpoint: 24 items, one set, 13 sources, zero events; integrity/foreign keys clean, no auth tables added. Original content file SHA-256 is unchanged. Normal private data was not used for QA or mapped to a Google account. Final source/checkpoint receipt accompanies the build outputs.

Still required: real private Google client/account setup and branding/consent review, successful real Google login/callback, final persistent-denial and in-flight client smoke, actual Android/Chrome, signed-in HTTPS cache/logout behavior, native file save/restore, Linux service/resource/proxy regression, approved off-machine restore and explicit server deployment approval. DNS is already user-created and verified; no other host/provider changes were made.

Earlier milestones below remain historical evidence.


## Historical milestone — 0.3, November 25, 2026

Twenty-eight automated tests pass under Node 24.22.3. This retains all 18 earlier tests and adds format/alias/order validation, escaped rendering/hidden answers, optional/deduplicated example installation with original-24 preservation, practice-history/scheduler separation with null and existing cards, stale schedule versus changed content behavior, bounded/paused/concurrent preferences and future-only recall-first, version-3/legacy backup compatibility, source/context preservation on edit and a full HTTP refinement test. HTTP checks cover expected-owner backup guards, idempotency, destination-bound preview and owner-isolated restore. All JavaScript syntax checks pass. No new dependency or SQL migration.

Chrome/Windows browser walkthrough used only D:/Codex/LearnLoop/tests/browser-v03, never the normal database. Observed:

- Added the optional three-example set; completed a gap using an alias and a process chain using keyboard-activated move buttons. Feedback explicitly says extra practice does not change the recall schedule.
- Paused introductions at zero, saved 3-minute/4-attempt recall-first preferences, saw the paused Today explanation; resumed at three new/day.
- Viewed full backup JSON, pasted it, got validated restore counts, typed RESTORE and observed successful restore with cleared preview/text and the same local profile.
- Corrected a process format as immutable revision 2; authored a new API gap and opened it. The later section-context preservation safeguard was unit-tested, not repeated on that old QA revision.
- Stopped server, checked an extra-practice answer, saw one pending; reloaded offline with it intact; restarted/reconnected and saw zero pending. Expected outage has calm pending messaging. Export is unavailable with pending work.
- With recall-first enabled, reviewed DCF-01, entered an explanation, checked required ideas and saved Good without choices. Today showed its next 10-minute return and zero delayed successes.
- Measured no horizontal overflow on Data/restore at 375 CSS pixels and Today at 390. A requested 320px viewport produced 305 CSS pixels after the scrollbar; Practice page width equaled viewport width (305), no overflow. This is desktop responsive testing, not actual Android or a complete minimum-width audit. Viewport override reset.

Screenshots are delivered outside the source repo: learnloop-v03-gap-phone.jpg, learnloop-v03-process-phone.jpg, learnloop-v03-today-phone.jpg, learnloop-v03-recovery.jpg and learnloop-v03-desktop.jpg. QA preview server was stopped. Clipboard copy itself, native file save/chooser, actual Android/install/background/update behavior, light theme, zoom/screen-reader audit and same-origin offline-tab/profile races remain unverified. Do not reuse stalled browser download/filechooser event waits. Pasted-JSON restore is now an observed alternative, not evidence of native-file success.

The original 24-item source file is unchanged. A read-only comparison against the pre-refinement D: checkpoint found all 12 content/progress/accepted-action tables identical: 24 items, one set, 13 sources, zero events, SQLite integrity OK and no foreign-key failures. Optional examples were not installed into the normal library. The research report is a targeted official-documentation/abstract pass, not paid-app hands-on benchmarking or proof of LearnLoop efficacy. Keep overlapping examples out of a clean control/assessment set.

The earlier evidence below is historical and retained for provenance.


## Historical milestone — 0.2, November 25, 2026

Eighteen automated tests pass after the sets/profile relational migration work. In addition to the original checks below, tests cover lossless legacy content/history/state migration, retained local sessions/dedupe ledger, automatic pre-migration snapshot, failed-migration rollback without changing legacy data, owner/set foreign keys, independent profiles, scoped API/backup/restore, legacy backup conversion and a global per-profile daily cap across sets. Tests used isolated D:\Codex\LearnLoop\tests fixtures. Syntax checks cover the new storage module, server, domain, client, service worker and backup helper.

A D: checkpoint was created before migration with a Git source bundle and consistent SQLite backup; bundle verification and SQLite integrity/foreign-key checks passed. A separate restore/migration rehearsal at D:\Codex\LearnLoop\tests\restore-rehearsal-8FIvq5 compared every legacy content/history/state field and verified the source recovery file's SHA-256 remained unchanged. It contained 24 items/zero learning events. The fixture migration test separately exercises a real scheduled recall history, not only an empty-progress seed.

Normal-library migration then passed the same full legacy-field comparison and integrity/foreign-key checks: 24 items, one set, zero events. The standard launch helper on loopback 8831 returned HTTP 200 and library schema 2 with those exact counts. A fresh post-migration source/database checkpoint at D:\Codex\LearnLoop\backups\2026-11-25T18-36-59-878Z-e4e1fbe5 passed verification for source implementation 5f2fc37. QA and launch-smoke servers were stopped at closeout.

Browser observations on the dedicated D: QA database: created Application architecture, added a manual API prompt into it, observed the original data-center set still had 24 items, created Friend QA with an independent 24-item starter library, then switched back and observed the original profile's new subject/item and selection preserved. These profiles are local developer conveniences, not real authentication. Final cached-profile naming and edit-form set preservation were checked in source/syntax after that walkthrough, without a second complete UI pass.

The browser download-event adapter again failed to return despite explicit short timeouts, eventually expiring the continuation. Download completion and file chooser/restore remain **unverified**; no testing progress is inferred from that wait. API attachment headers, checksums and restore behavior pass automated tests. Do not use the broken automation wait again as evidence of an app download failure or success. Actual Android/Chrome, same-origin offline-profile/tab races and manual file download/restore remain pre-pilot smoke checks.

The sections below preserve the original 0.1 evidence. No source/runtime credentials or learner data are in Git; D: is local recovery, not an off-machine backup service.

## Historical 0.1 evidence

Local prototype checks completed November 24–25, 2026. No deployment or actual Android test.

## Automated

Node 24.22.3 on Windows. `node --test test/*.test.mjs`: 12 tests pass. Syntax checks pass for server, domain, client and service worker. The Windows launch helper parses without PowerShell errors. Dependency lock pins ts-fsrs 5.2.3 (FSRS-6). The HTTP test uses temporary isolated SQLite data and loopback sockets; sandbox socket restrictions required running that test outside the sandbox. It does not expose a LAN listener.

The normal `start-learnloop.ps1` launch was also run on loopback port 8831 using a fresh default data directory. HTTP returned 200 and its local library contained exactly 24 items, 13 sources and zero learning events. The QA and launch-smoke servers were stopped after verification. Use the documented normal launch on port 8830 to try the app.

Covered: exact seed count/modes/sources, recognition separation and repeat gates, three introductions/day, wrong-choice retry, complete-answer rating constraints, deterministic FSRS, Again retry, distinct-day lapse pause, concurrent stale-attempt preservation/resolution, immutable corrections, backup checksums/schema/references, content import without grades (including multiple source references), local authorization/origin checks, two-client shared state, idempotency and action-ID misuse, duplicate conflict handling, invalid restore/no mutation, confirmed restore/recovery file/epoch change, stale pre-restore action rejection and restart persistence.

The original pack is copied unchanged: SHA-256 `399994974e214194e8fd90c4558f74dfb9cb20029e4d09a3d09dc539a3b2fdd7`. Choices are separately authored draft additions: SHA-256 `742768f43743c11abf5bf95c689562cd44507bf6039002c8e0e6f6c2de92dd6c`.

## Browser walkthrough observed

Chrome on Windows, dark system theme. Separate QA database (`data/browser-qa`), not the normal fresh library.

- Phone-sized layout: opened library; reviewed DCF-01/02/03; completed first choices, interleaved repeated choices, then reached free recall without a recognition grade being treated as recall.
- Typed an answer, revealed reference answer, confirmed Hard/Good/Easy disabled until all required ideas checked, and saved Good. The session continued to the next recall item.
- Stopped the local server during DCF-02 recall, chose unknown/Again, observed one pending attempt. Reloaded while the server was unavailable: cached shell and one pending attempt survived. Restart/reconnect showed zero pending and accepted shared progress.
- Opened `localhost:8830` with separate cookies/IndexedDB from `127.0.0.1:8830`; saw DCF-01's Recall stage, future due time and Good history from the first origin.
- Library search for handover returned the relevant four items.
- Captured a passage as a note, converted it into a recall prompt/answer/two required ideas, and observed a 25th QA item.
- Captured phone recall and desktop progress screenshots. Phone-width DOM check reported 375 CSS pixels and no horizontal overflow. Viewport overrides requested 390 and 320, but the narrowest observed width was 375; **320 is not verified**. Temporary overrides were reset.

Browser automation stalled waiting for the full-backup download and its continuation expired. The final download path/result and browser file-input/restore flow are **not verified**. API backup/restore passed independently. No app exception was observed in the inspected browser log; extension warnings were outside the app. Do not interpret that limited log inspection as a full audit.

After the walkthrough, final safeguards added transactional same-origin-tab outbox updates, content-revision IDs on actions/conflicts, imported source-scope preservation, item-subject correction and stricter restore validation. Automated tests and syntax checks were rerun; those final client safeguards have not had a second complete browser regression run. A fresh browser smoke pass, including two offline tabs and file backup/restore, is a pre-pilot gate.

## Still required before a phone/friends release

Real Android/Chrome device/version, installation/home-screen icon behavior, light theme and keyboard/screen-reader audit, 320px and zoom layouts, background app suspension/reconnection, update while answering, browser download/file chooser/full restore, same-origin multi-tab offline race smoke test, real sign-in and cross-user ownership tests, approved persistent HTTPS host, tested off-machine recovery, content/distractor review and delayed-recall comparison.

No user data or QA progress is included in the delivery archive. A fresh normal launch creates exactly 24 starting items.

## Recovery rehearsal closeout — November 26

Implementation cd36ff01222e56287d3667c8563f4b255a67dc89 was normally pushed and independently read back from origin/build/local-prototype. New private checkpoint D:/Codex/LearnLoop/backups/2026-11-26T18-06-50-999Z-9ac2a6f8 contains its verified source bundle plus self-contained SQLite and manifest. Actual CLI recovery into D:/Codex/LearnLoop/tests/release-prep-2026-11-26/normal-library-recovery-180712930 preserved both owners, 48 total items, 26 total sources and zero learning events; cleared two local sessions; integrity/foreign keys passed. Source checksum matched its trusted manifest afterward. The active primary database was never replaced or used for QA mutations. The fixture tests separately prove preservation of nonempty scheduled recall history and immutable hosted identities while clearing hosted sessions/flows.

The initial Git fetch failed; retrying the authorized push with TEMP/TMP redirected to D: succeeded. Chrome/Google setup remains blocked by the observed full C: drive. No new provider credentials/consent, live Google callback, browser-guard smoke, Android test, Linux rerun or HQ deployment was claimed. No preview server was started. Final documentation may follow the implementation SHA; inspect the live branch. Current writable checkout is the D: path above; C: checkout remains at 7a8a9ec and should be refreshed only after disk space is restored, preserving its ignored private data.
