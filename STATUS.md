# LearnLoop active state

Updated November 25, 2026 · owner Sam · local build lane

## Current milestone

Version 0.1 local prototype is built: 24 source-linked data-center-flow items, staged Review → choice → interleaved repeat → production recall, pinned FSRS, SQLite persistence, offline recall/outbox, explicit conflicts, source corrections, notes/manual items and JSON recovery. Twelve automated tests pass. Phone-sized/PC browser walkthrough covered core practice, separate-origin shared progress, offline reload/reconnect and note conversion. Actual Android and the final browser backup/restore path remain unverified.

## Active work

LL-N00: locally implement multiple learning sets and explicit per-user storage while preserving the 24 items, revisions and progress. Local profile testing is not Google sign-in or a hosted identity system. Re-run migration, owner-isolation, restore and UI smoke checks before marking it complete.

| Area | State | Next gate |
| --- | --- | --- |
| Personal recall prototype | Built/tested locally | Sam uses it and reviews new choice distractors |
| Multiple sets / user-owned data | In progress locally | Lossless migration and independent progress tests |
| Source/status continuity | Repository checkpoint in progress | Commit, push and remote-SHA readback |
| Private local recovery | D: checkpoint being prepared | Consistent SQLite backup, integrity check and source bundle |
| Regular continuity | Daily heartbeat being configured | Record confirmed scheduler result; never infer unattended availability |
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
