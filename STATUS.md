# LearnLoop active state

Updated November 25, 2026 · owner Sam · local build lane

## Current milestone

Version 0.2 local prototype is built: the 24-item recall prototype plus multiple learning sets, create/select-set flows, set-specific manual authoring and explicit owner-scoped relational storage. Local profiles demonstrate separate content/progress; they are not real sign-in or shared-device security. Eighteen automated tests pass. Browser checks observed set creation, adding a manual item, creating a second profile with independent starter progress, and switching back to the original profile's set. Actual Android and browser file download/restore remain unverified.

## Active work

LL-N00 local scope is implemented and tested. Legacy content, immutable revisions, history, schedules, epoch, item versions, old local sessions and accepted-action ledger survive migration. Migration was rehearsed on a copy of the D: recovery checkpoint; source checkpoint remained unchanged. The normal library is now migrated and compared against every legacy content/history field: 24 items, one set, zero learning events, SQLite integrity/foreign keys OK. Standard launch smoke returned HTTP 200 with that same library. Source implementation checkpoint 5f2fc3735d84cadad25db8827a9643cd855135da is pushed and remote-SHA verified. A post-migration D: checkpoint passed bundle/database verification. Next development gate is actual hosted identity/access design and remaining device/file smoke tests.

| Area | State | Next gate |
| --- | --- | --- |
| Personal recall prototype | Built/tested locally | Sam uses it and reviews new choice distractors |
| Multiple sets / user-owned data | Built/tested locally | Real hosted identity and permissions still required for friends |
| Source/status continuity | 0.2 implementation pushed/read back at 5f2fc37; closeout docs also checkpointed | Continue normal pushes/readback at material milestones |
| Private local recovery | Pre/post-migration D: checkpoints and restore rehearsal verified | Keep independent off-machine recovery as a hosted-pilot gate |
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

Post-migration checkpoint: D:\Codex\LearnLoop\backups\2026-11-25T18-36-59-878Z-e4e1fbe5 (source implementation 5f2fc37). Later documentation/source checkpoints can exist under the same backup root; inspect their manifests. Owned QA/launch servers were stopped. Normal launch stays node server.mjs on loopback port 8830. QA data stays separate on D:; it was not copied into the normal library.
