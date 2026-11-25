# LearnLoop active state

Updated November 25, 2026 · owner Sam · local build lane

## Current milestone

**0.3.0 local refinement complete.** Research compared learning-method evidence and official Anki, Quizlet, RemNote and Duolingo documentation. Built optional authored fill-the-gap/process-ordering practice, personal pace/recall-first preferences, clearer Today/returns/empty states and pasted-JSON recovery. Extra practice stays separate from production recall. Original 24 items and 13 source records are preserved; three optional examples install into a separate set only on request.

**28 tests pass**, plus syntax and whitespace checks. Browser checks observed both modes, keyboard ordering, format correction/authoring, preferences, recall-first progression, upcoming return, offline pending/reconnect and pasted-JSON preview/confirmed restore. Actual Android, native save/chooser/clipboard copy, light theme, zoom/screen-reader and same-origin offline-tab races remain open. Software verification does not demonstrate learning efficacy.

No SQL migration or new dependency. Library schema remains 2; new backup schema 3 accepts prior 1/2 files. Normal library is separate from D: QA: original 24 items/one set/zero learning events. Local profiles are development conveniences, not secure identity.

## Status

| Area | State / next gate |
| --- | --- |
| Personal recall prototype | Built/tested locally; Sam uses it and reviews content/choices separately from usability |
| Extra formats / pace / JSON recovery | Built/tested in 0.3; review derived examples and assess friction |
| Multiple sets / personal ownership | Built in 0.2, preserved; real sign-in/shared-set policy before friends |
| Source/status continuity | Normal branch commit/push/readback at closeout; receipt outside Git |
| Private recovery | Pre-refinement D: checkpoint verified; final clean-source checkpoint at closeout |
| Daily continuity | ACTIVE back-up-learnloop-continuity, 11 p.m. local; requires app/computer/permissions |
| ASL subdomain / friend pilot | Proposed learn.allstreetlabs.com; see docs/operations/hosted-personal-pilot.md. Host/sign-in/release approval and off-machine recovery/Android tests remain open |
| Avala / Intel Hub / Talent Network | Future candidates, no connection assumed |
| Social / subscriptions / native app | Future candidates after personal use/small pilot evidence |
| AgenticHQ | Unresolved: supplied Think Tank ID not found, later searches repeatedly requested auth; reconcile without duplicates |

## Next useful work

Try Today with the normal library; Practice → Add source-linked examples is optional. Review the derived examples for source support independently from client usability. Finish device/native-file/accessibility/multi-tab checks without stalled download-event adapters. Use the equal-time seven-/21-day validation plan and keep overlapping examples out of the control. Quick capture and safe grade undo are next candidates before more modes.

Hosting remains separate. Android cannot reach this PC's loopback address. Shared progress is demonstrated across sessions on the same server/profile; phone/PC access still needs approved hosting/authentication.

## Recovery

- Start: README.md, AGENTS.md, docs/handoff.md.
- Backlog: docs/backlog.md; decisions: docs/decisions/; research: docs/research/2026-11-25-learning-methods-and-app-review.md.
- Architecture: docs/architecture/overview.md; evidence: docs/verification.md; experiment: docs/validation-plan.md.
- Policy: docs/operations/continuity-and-backups.md. Ignored runtime data under data/; never commit learner records/exports/sessions/credentials.
- Launch: node server.mjs, http://127.0.0.1:8830. Owned QA server stopped. QA: D:/Codex/LearnLoop/tests/browser-v03.
- Verified baseline before refinement: source/remote 60fee107d1c94c274bd7c6841d568668d4037b52; pre-change checkpoint D:/Codex/LearnLoop/backups/2026-11-25T18-43-05-187Z-6e53e041.
- Final source/remote SHA and private checkpoint receipt: delivered outputs/learnloop-checkpoint.json outside Git. Recheck live state before resuming.

Authorization: local building/testing/refinement, dedicated D: use, normal source/doc branch pushes and regular continuity. No infrastructure, spend, hosting/deployment, invitations, new autonomous build jobs or commercial pipeline. AgenticHQ owns operations/approvals, shared-sync continuity, SAMOS navigation/provenance; checked historical revisions in the handoff are not current-state claims.
