# Verification and limits

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
