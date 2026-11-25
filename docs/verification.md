# Verification and limits

## Current milestone — 0.2, November 25, 2026

Eighteen automated tests pass after the sets/profile relational migration work. In addition to the original checks below, tests cover lossless legacy content/history/state migration, retained local sessions/dedupe ledger, automatic pre-migration snapshot, failed-migration rollback without changing legacy data, owner/set foreign keys, independent profiles, scoped API/backup/restore, legacy backup conversion and a global per-profile daily cap across sets. Tests used isolated D:\Codex\LearnLoop\tests fixtures. Syntax checks cover the new storage module, server, domain, client, service worker and backup helper.

A D: checkpoint was created before migration with a Git source bundle and consistent SQLite backup; bundle verification and SQLite integrity/foreign-key checks passed. A separate restore/migration rehearsal at D:\Codex\LearnLoop\tests\restore-rehearsal-8FIvq5 compared every legacy content/history/state field and verified the source recovery file's SHA-256 remained unchanged. It contained 24 items/zero learning events. The fixture migration test separately exercises a real scheduled recall history, not only an empty-progress seed.

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
