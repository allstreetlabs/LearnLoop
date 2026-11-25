# Verification and limits

## Current milestone — 0.3, November 25, 2026

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
