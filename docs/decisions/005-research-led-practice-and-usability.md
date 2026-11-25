# 005 — Research-led practice and usability

November 25, 2026 · accepted for local 0.3 · owner Sam

Sam authorized research, local refinement and a couple of useful additional modes. Fixed pace, unclear caught-up states, one presentation for every subject and stalled native-file automation were practical gaps. The research report compares official app documentation and primary scientific records/abstracts, rather than hands-on paid-app benchmarking. Retrieval and spaced returns remain central; transfer depends on task/context.

## Decisions

- Add optional single-gap practice with authored aliases, and 3–8-step process ordering with move buttons/keyboard. Main prompts must remain useful without cues. Deterministic comparison is not semantic grading; provided steps do not demonstrate independent application. Hints/reveals stay visible.
- Record extra practice separately: no FSRS, stage, item-version, repeat-gate, introduction-count or delayed-success changes. Never send raw typed answers. Scheduling-version differences are harmless for unscheduled practice; changed content creates a preserved conflict.
- Install three source-linked derived examples only on explicit action into a separate set. Deduplicate without overwriting edits; retain the original 24. Keep overlapping concepts out of independent assessment/control material.
- Permit new/day 0–10, minutes 3–15, attempts 3–20 and guided/recall-first for future introductions. Retain defaults/FSRS parameters. Optimistic settingsVersion prevents silent concurrent preference overwrite; draft remains for review/resave.
- Clarify Today with returns, remaining allowance and pending/offline/paused reasons; collapse explanation and make empty states actionable.
- Add backup JSON view/copy and paste-to-preview/confirmed restore alongside files. Use identical validation/owner/destination/epoch/revision binding and pre-restore recovery. Guard stale-owner attachment links. Native saving/clipboard/chooser remain unverified.
- Preserve unchanged source identity/scope, secondary references and section/variation context during corrections. Still append immutable revisions and reset learning; cosmetic-only scheduling preservation is deferred.

## Compatibility and consequences

Library/SQLite schema stays at 2: optional metadata fits existing JSON fields. No migration, reseeding or new package. Export becomes learnloop.backup/3, appVersion 0.3.0; prior versions 1/2 remain accepted. Service-worker cache v3 includes new modules and continues waiting without interrupting answers.

Options are collapsed to limit authoring friction. Exact aliases may reject valid alternative wording; feedback asks for comparison rather than claiming semantic error. Process examples explicitly limit their dependency chain because real work overlaps. These are product experiments, not evidence that new formats outperform free recall.

28 tests verify invariants, validation, ownership, conflicts and recovery alongside baseline scheduling/migration tests. Browser checks observed modes, authoring, preferences, offline/reconnect and pasted restore. Actual Android/native files/accessibility/multi-tab smoke remain open. Content quality and delayed learning benefit remain separate validation questions.

No deployment, service, provider account, automatic compiler, social feature or integration. Next candidates after use: quicker capture, safe grade undo, visual identification and worked calculations when real subject material warrants them.

