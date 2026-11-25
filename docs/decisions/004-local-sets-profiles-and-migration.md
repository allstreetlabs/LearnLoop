# ADR 004 — local learning sets, profile-owned data and recovery

November 25, 2026. Sam authorized independent local building/testing/refinement, use of D: and regular source/status repository backups. No host, provider account or deployment is created.

## Built in 0.2

- Promote one-owner JSON persistence into relational SQLite tables: users, library metadata, learning sets, sources, items/revisions, item/source locators, progress, review events, drafts, conflicts, accepted actions and local sessions. Composite owner keys and foreign keys prevent accidental cross-owner set/item links. The domain layer still uses a portable versioned library projection; transactionally replacing one owner's projection is sufficient for this small prototype.
- Preserve the original library's epoch, item versions, content, source scopes, immutable revisions, event IDs/order, schedules, sessions and action-deduplication records. Snapshot before migration; keep legacy tables as recovery evidence. Rollback normalized tables on failed migration; do not reseed existing data.
- Allow creation and selection of private learning sets and author manual items into them. Queue selection follows the selected set; three introductions/day remain global per profile. Original staged choice checks remain on the starter set; new personal items use review and free recall.
- Add local development profiles with separate source/content/history and independent starter sets. Every private API derives ownership from the local session, not a request owner ID. These profiles are not hosted authentication or shared-device security: anyone controlling the local computer can choose a profile. Real provider sign-in is still a pilot gate.
- Key browser caches, outboxes, editor/answer drafts and set selection by profile. Keep old device keys as migration recovery evidence and prevent replay with a migration marker. Detect a different profile cookie from another tab before accepting a state response; retain pending work and require reopening the correct profile.
- Export `learnloop.backup/2` with library schema 2. Verify legacy schema-1 checksums before upgrading. Restore into the authenticated current profile only, create a new epoch and leave other profiles unchanged. Bind preview to file, mode, import destination and current library revision.

## Checkpoints

Source and continuity are pushed normally to the product working branch and verified by remote SHA. A daily maintenance heartbeat is authorized. Private source bundles/consistent database copies and restore rehearsals use only D:\Codex\LearnLoop. D: is local recovery, not off-machine backup. The normal browser outbox is not captured by a server database copy; sync it or use device recovery export first.

## Verification and remaining limits

18 automated tests cover migration fidelity/rollback, owner isolation, schema relationships, independent grades, backup compatibility and original recall/sync behavior. A pre-migration D: recovery copy was restored/migrated in a separate directory and compared against every legacy content/history field; original recovery bytes unchanged. Browser checks observed new-set creation, manual authoring, independent profile starter state and return to original set selection. The browser download event adapter again stalled despite explicit timeouts; file download/chooser/restore and actual Android remain manual checks. No competition, social sharing, billing or cross-app integration was built.
