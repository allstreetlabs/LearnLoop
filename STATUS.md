# LearnLoop active state

Updated November 25, 2026 · owner Sam · local build lane

## Current milestone

Version 0.2 local prototype is built: the 24-item recall prototype plus multiple learning sets, create/select-set flows, set-specific manual authoring and explicit owner-scoped relational storage. Local profiles demonstrate separate content/progress; they are not real sign-in or shared-device security. Eighteen automated tests pass. Browser checks observed set creation, adding a manual item, creating a second profile with independent starter progress, and switching back to the original profile's set. Actual Android and browser file download/restore remain unverified.

## Active work

LL-N00 local scope is implemented and tested. Legacy content, immutable revisions, history, schedules, epoch, item versions, old local sessions and accepted-action ledger survive migration. Migration is rehearsed on a copy of the D: recovery checkpoint; source checkpoint remains unchanged. Current closeout: verify normal-library migration, push the final source/docs and make a fresh private D: checkpoint. Next development gate is actual hosted identity/access design and remaining device/file smoke tests, not more local profile security claims.

| Area | State | Next gate |
| --- | --- | --- |
| Personal recall prototype | Built/tested locally | Sam uses it and reviews new choice distractors |
| Multiple sets / user-owned data | Built/tested locally | Real hosted identity and permissions still required for friends |
| Source/status continuity | First checkpoint pushed and verified at 0179488 | Final 0.2 checkpoint pushed/read back at closeout |
| Private local recovery | Verified before migration on D: | Refresh after final committed source and normal-library migration |
| Regular continuity | ACTIVE daily heartbeat: back-up-learnloop-continuity | 11 p.m. local schedule; requires computer/app/permissions available |
| ASL subdomain / friends pilot | Proposed, not deployed | Approved host, real sign-in, ownership checks, recovery and Android test |
| Avala / Intel Hub / Talent Network | Future candidates | Concrete integration contract selected later |
| Social, competition, subscriptions, native app | Future candidates | Evidence from personal use and small pilot |
| AgenticHQ linkage | Unresolved | Supplied ThinkTankItem not found in prior reads; latest search repeatedly requests reauthentication |

## Recovery pointers

- Start: README.md and AGENTS.md.
- Feature backlog: docs/backlog.md; decisions: docs/decisions/; future ideas: docs/product/future-opportunities.md.
- Architecture: docs/architecture/overview.md; checks/limits: docs/verification.md.
- Handoff: docs/handoff.md; maintenance policy: docs/operations/continuity-and-backups.md.
- Runtime data: ignored data/ directory. D: recovery destination: D:\Codex\LearnLoop\backups. Never commit either to Git.

November 25 authorization includes local refinement, using D: as needed, normal source/doc branch pushes and regular continuity maintenance. Hosting, deployment, paid services, invitations and a commercial pipeline remain separately approved actions. Check the live remote and status before resuming; do not equate a local commit with a verified remote backup.
