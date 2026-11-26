# LearnLoop active state

Updated November 25, 2026 · owner Sam · local build lane

## Current milestone

**0.4.0 Google identity and hosted-security implementation built/tested locally.** Includes one-time state/PKCE/nonce, signed identity validation, private invitation→existing-library mapping, separate hosted sessions, owner isolation, hosted profile-picker removal, canonical HTTPS proxy/origin checks, rate limits, health/readiness and sign-out/device-cache controls. Default PC launch stays local. Original24 items, sources, learning history and schema 2 are preserved; auth tables are created only in hosted mode after a private snapshot.

**38 tests pass on Windows and local Ubuntu/Node 24.22.3**, plus syntax checks. Dependency audit reports no known vulnerabilities at this check. Browser uses a fictional signed-identity fixture: login, review, opted-in offline reopen/note sync, other-tab sign-out, retained progress and opt-out offline lock observed. Final persisted-denial/in-flight guards were source/syntax/helper checked after walkthrough; later client smoke remains. This is not a live Google/TLS/HQ acceptance or independent security audit.

## Status and next gate

| Area | State / next gate |
| --- | --- |
| Personal learning / formats / pace / JSON recovery | Implemented through 0.3, preserved and regressed in 0.4 |
| Hosted Google identity / private ownership | Built/tested locally; private Google client + first account/consent/branding and live callback still needed |
| Device privacy / offline | Opt-in personal-device reopening, expiry/denial gate, explicit clear-device logout; actual HTTPS/Android and final-guard client smoke open |
| ASL hostname / host choice | learn.allstreetlabs.com + ASL HQ selected; user-added A→162.35.191.47 TTL3600 independently verified |
| Runtime / deployment | Node 24.22.3 Linux x64 archive checked against official SHA256 manifest and used only locally; HQ still unmodified |
| Recovery | Pre-auth D: checkpoint verified; final source/private checkpoint at closeout; off-machine destination/restore/job approval open |
| Source/status continuity | Normal branch commit/push/readback at closeout; final receipt in delivered outputs |
| Daily continuity | Existing continuity-only heartbeat; no new jobs created |
| AgenticHQ | Exact item still not_found after auth retry (5ae073e0-52de-4cbf-a664-ef9e83fa5158); no duplicate |
| Friends / social / subscriptions / Avala / Intel / native app | Later candidates, no invitation/integration or commercial work |

Next: private Google client/account setup, late client/actual-device smoke, exact off-machine recovery and concrete deployment review. Source/runtime artifact, provider/server/backup changes and acceptance/rollback must be reviewable before final approval. Do not expose local mode or the test fixture on HQ.

Start with README, AGENTS, docs/handoff.md, docs/backlog.md, ADR 006, docs/verification.md and docs/operations/asl-hq-deployment-plan.md. Private runtime data stays ignored under data/; QA stays in isolated D:/Codex/LearnLoop/tests or local Ubuntu /tmp. Normal launch: node server.mjs at 127.0.0.1:8830. All owned previews stopped.

Authorization: local building/testing/refinement, dedicated D: use, normal source/doc backups and existing continuity maintenance. DNS was added by Sam. No other infrastructure, provider configuration, deployment, spend, invitations or autonomous jobs were authorized/executed.
