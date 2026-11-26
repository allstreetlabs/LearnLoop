# Preparing a private SQLite recovery

November 26, 2026. This is an offline operator tool, not an automatic restore or backup job. It does not install data, start the app, configure Google or deploy anything.

Create a consistent checkpoint with `node scripts/backup-local.mjs --destination <private-backup-directory>`. The updated helper normalizes only its new SQLite copy to DELETE journal mode, so a closed checkpoint is self-contained. Verify its source bundle, manifest and file SHA256. Store private database copies and receipts outside Git. A digest proves equality with the trusted receipt; it does not establish authenticity by itself.

Run with Node 24:

```text
node scripts/prepare-recovery.mjs --source <absolute-checkpoint-sqlite> --sha256 <trusted-manifest-sha256> --destination <new-absolute-directory>
```

The destination's parent must already exist. The command refuses an existing destination, release-directory placement, digest mismatch, live SQLite sidecars, WAL-mode snapshots, corrupt/incomplete/unsupported schemas and foreign-key failures. Old checkpoints with WAL headers need a separately verified normalized copy; never delete sidecars from a possibly live database to bypass the guard.

Preparation copies through SQLite backup into a new private candidate and verifies every preserved table. It retains users, content/sources/revisions, schedules/history, drafts/conflicts, accepted-action deduplication and immutable Google identity mappings. It clears local sessions, hosted sessions and unfinished OAuth transactions. Restored browser sessions must sign in again; local device pending work still needs explicit reconciliation.

Only a completed candidate has `recovery-receipt.json` with `prepared-not-installed`, source/candidate digests, integrity results and cleared counts. The receipt contains no email, subject, token or raw learning content. Failed candidates remain for diagnosis with `RECOVERY-NOT-APPROVED.txt` when possible. Do not use them or retry into the same directory. File mode 0600/directory 0700 apply where supported; verify Windows ACLs and eventual Linux ownership separately.

Before any actual cutover: preserve the newer live data and pending device work, stop only LearnLoop, choose the accepted recovery point, privately review all owner mappings, check the receipt, apply the intended Linux owner/permissions and hosted config, then obtain the applicable deployment/restore approval. This tool cannot merge newer progress into an older checkpoint and does not itself prove off-machine recovery.

Local verification uses two owners and real scheduled recall history, plus invalid/corrupt/unrelated snapshots, session/flow revocation, immutable identities, unchanged source bytes/no source sidecars and existing-file preservation. See verification.md for the exact dated run and limits.
