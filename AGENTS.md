# LearnLoop build lane

Product authority: Sam. Personal learning comes first. Repo: https://github.com/allstreetlabs/LearnLoop.

LearnLoop is a provisional code/project name; see docs/product/naming.md before public branding decisions. On November 26 Sam explicitly authorized the dedicated Google Cloud project creation; that project exists with no linked billing account. This narrow authorization does not imply OAuth client/credential/consent setup or host deployment approval. Read current STATUS.md before relying on older no-project statements.

Read README.md and docs/handoff.md before changing the prototype. Preserve sources and review history. Do not expose raw typed attempts in persisted review events. Recognition does not count as production recall. Run `npm test` and `npm run check` after changes to scheduling or persistence. Keep runtime data, exports and credentials out of Git.

Local building, testing and refinement are authorized, including a dedicated LearnLoop workspace on D:. On November 25 Sam explicitly requested regular repository backups of active state, features, status and continuity. Update STATUS.md, backlog and handoff at material milestones; commit reviewed product source/docs and push this repository's working branch with a normal non-force push, then verify the remote SHA. This supersedes the earlier local-only/no-push boundary for source/documentation backups. Never put learner databases, exports, sessions, credentials or raw responses in Git. Read docs/operations/continuity-and-backups.md.

One daily continuity-backup heartbeat is authorized by that request; it is maintenance, not a standing autonomous build job. Hosting, deployment, infrastructure, paid services, other autonomous jobs and commercial content production still require separate approval. Local mode must bind only loopback; it is not a production identity system. AgenticHQ owns operations and approvals, shared-sync continuity, SAMOS navigation/provenance. Do not create duplicate operational records when reads are inconclusive.
