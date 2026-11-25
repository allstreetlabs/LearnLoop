# Continuity and backups

Sam requested regular repository backups of active state, feature backlog, status and continuity on November 25, 2026. He also authorized local building/testing/refinement without him and use of D: where useful. This supersedes the previous local-only source push restriction. It does not authorize hosting or deployment.

## At each meaningful development milestone

1. Read AGENTS.md and STATUS.md. Inspect branch/worktree and fetch the owning remote; preserve concurrent changes and never force push.
2. Update STATUS.md with what is built, what is active, exact checks and remaining gates. Keep docs/backlog.md feature acceptance/status, architectural decisions and docs/handoff.md aligned. Shared-sync gets a compact continuity pointer, not a second implementation store.
3. Run checks appropriate to the changed behavior. Separate passing API/unit tests from observed browser/device results. Record incomplete verification honestly.
4. Review the diff and tracked paths. Commit only LearnLoop source/documentation. Exclude all learner records, private backups/exports, secrets, sessions and browser data. Keep code commits separate from private runtime recovery.
5. Push the working branch to https://github.com/allstreetlabs/LearnLoop with a normal push. Verify the remote branch SHA equals the intended local commit. Report local/committed/pushed/verified separately. Do not merge, rewrite history, modify unrelated repos or trigger deployment.

One daily heartbeat repeats this maintenance for the current chat. It may update evidence-backed docs and back up already-reviewed authorized work; it must not start product implementation, infrastructure or other jobs. Do not create no-op commits on unchanged days. Execution requires the local app/computer and permissions to be available; no always-on service is implied. Scheduler identity/status is recorded after creation.

Confirmed automation: `back-up-learnloop-continuity`, ACTIVE, daily at 11 p.m. local Central time. The app reported creation and its view card was read back. This is the only recurring job authorized here.

## Private local recovery on D:

Use only the dedicated D:\Codex\LearnLoop tree. `node scripts/backup-local.mjs --destination D:\Codex\LearnLoop\backups` writes a uniquely named checkpoint containing a source Git bundle, a transactionally consistent SQLite backup (when runtime data exists), and a manifest/checksums. It verifies the bundle plus SQLite integrity/foreign keys. It refuses to label a dirty source worktree a committed checkpoint. No destructive cleanup or retention job is configured.

Back up before schema migrations and after material local data changes. Use a separate D:\Codex\LearnLoop\tests directory for disposable test/rehearsal data; never point tests at the normal runtime database. D: is a second local disk location, not off-machine disaster recovery. No private database or manifest containing learner data goes to the public GitHub repository. A hosted pilot still requires approved off-machine backups and a tested restore process.

## Boundaries and missing owners

Product repo owns implementation and its active status. AgenticHQ owns operational tasks/approvals; current linkage is unresolved, so record read/auth failures rather than inventing records. Shared-sync owns cross-agent continuity; SAMOS is navigation/provenance. This maintenance does not create an alternative operational approval system. Secrets and private learner data never belong in continuity files.
