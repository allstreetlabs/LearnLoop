# MVP backlog and release boundaries

November 25, 2026 · local 0.2 build complete; hosted pilot not approved/deployed

## Implemented local slice

| ID | Behavior / acceptance criterion | Evidence |
| --- | --- | --- |
| LL-P01 | Seed exactly DCF-01–24 and 13 sources once, preserve source dates/scopes/locators, show answer/explanation/required ideas. Restart cannot reseed progress. | Domain and server tests; phone/browser walkthrough. |
| LL-P02 | Review → correct first choice → interleaved correct repeat → production recall. Failed checks remain in place. Two distinct other graded items or ten minutes required between repeats; recognition never advances FSRS. | Domain tests; full phone-sized walkthrough. |
| LL-P03 | No reveal until typed attempt, explicit aloud or unknown. Hard/Good/Easy require all rubric points and an attempted answer; missing/unknown requires Again. Typed prose never enters a server event. | Domain tests and browser self-check gating. |
| LL-P04 | Pinned FSRS recall schedule, due first, three shared introductions/day, short sessions. Four distinct lapse dates after prior success pause for repair. | Deterministic scheduler, daily-cap, retry and lapse tests. |
| LL-P05 | One SQLite library shared across independent sessions. Idempotent action delivery, same-item conflict preservation/resolution, server-accepted ordering, revision checks. | Two-client HTTP tests and separate-origin browser history check. |
| LL-P06 | Cached shell/library reloads offline; due recall queues durably, item is excluded pending acknowledgment, reconnection accepts once. Introductions/edits remain online. | Browser server-stop/reload/restart walkthrough plus server dedupe tests. |
| LL-P07 | Capture note/passages and optional safe link; convert to prompt/answer/1–3 ideas; source/context visible. New manual items skip choice generation. | Browser capture and conversion to a 25th QA item; input/domain validation. |
| LL-P08 | Every correction creates an immutable revision and resets learning. Old events keep old content/source references; stale attempts cannot grade the new revision. | Domain revision/conflict tests; browser correction form not fully exercised. |
| LL-P09 | Full JSON backup/checksum, atomic validated restore with pre-restore recovery file/new epoch. Content JSON adds review items only and skips identical content. | Server/domain tests. Browser download and file chooser/restore still need manual smoke test. |
| LL-P10 | Responsive phone/PC UI, system fonts, focus styles, native controls, reduced motion, no runtime CDN. | Browser phone-sized and desktop walkthrough. Actual Android and minimum-width/zoom/a11y audit remain open. |

## Before first ASL-subdomain pilot

The following is proposed work, not permission to host or invite friends.

**LL-N00 — completed local scope in 0.2: multiple sets and personal ownership.** Explicit local profiles, private learning sets, relational sources/item revisions and per-profile progress/history are implemented. Create/select-set and set-specific manual authoring work. All existing 24 IDs, source scopes, corrections, accepted events, schedules, sessions and dedupe ledger are preserved by tested migration. Eighteen tests pass, including failure rollback, independent progress and restore isolation; browser checks observed set creation/authoring and profile switching. Only private ownership is implemented; shared-set grants remain LL-N03. Local profiles are not secure sign-in; LL-N02 and actual hosted identity are still required before friends access it. No hosted database service was provisioned.

1. **LL-N01 — approve a concrete host/access plan.** Confirm exact ASL domain and desired subdomain, existing runtime/durable storage, operating owner, cost, TLS, rollback and backup destination. Prefer existing suitable ASL infrastructure if verified. Do not assume Playspace. Approval is a final gate after a reviewable plan; no provisioning or deployment now.
2. **LL-N02 — real authentication and per-person ownership.** Remove/disable local session creation in hosted mode. Invitation-only sign-in, no public registration. Every private API and backup is scoped to the authenticated owner; devices cannot choose owner IDs. Acceptance: user A cannot read/export/edit/grade/restore user B's private data through any endpoint, including guessed IDs and conflicts. Two devices for A share A's progress; two different learners do not.
3. **LL-N03 — define shared-set behavior.** Separate reusable learning-set revisions from personal progress and notes. Sharing is explicit; friend's notes/history are private by default. Decide who can publish corrections and how learners accept them. Acceptance: editing a shared set cannot silently change another person's reviewed answer or completed history.
4. **LL-N04 — persistent hosting and recovery.** Test a full restore on an isolated service/storage copy, verify off-machine backups and storage persistence through restarts/releases. No database on ephemeral filesystem. Keep secrets out of the repo. Jobs or paid services require their own authorization.
5. **LL-N05 — actual Android/Chrome test.** Record device, Android/Chrome versions. Verify comfortable typing/aloud self-check, home-screen behavior, reconnect, install/update without losing a draft, and phone Save to Files/restore. Make the full JSON download/file input path demonstrably work; browser automation timed out during its first download check here.
6. **LL-N06 — pilot content review and delayed-recall trial.** Sam reviews 24 answers and the new choice distractors separately from UI. Validate ambiguity, answer-position/length cues, overly obvious options and coverage. Run the small comparison in `validation-plan.md`; refine before expanding the set.

## Deliberately deferred

No certification packs/business, billing, public marketplace or signup; no 120-item expansion goal; no autonomous scraping/content generation, Ziggy runtime dependency, model grader, audio recording/transcription, reminders/jobs, document upload parser/OCR, web extraction, native Android package, graph/hierarchy engine, full offline editing or CRDT. CSV, arbitrary content-schema translation and cosmetic-only correction preservation are useful later. The initial local owner model is not the friends release's access model.

Subscription access and attachment to another ASL product remain possible later outcomes. Prioritize sustained personal learning and small-pilot feedback first; no billing or integration framework is included in the next slice.

## Future opportunity register

See `product/future-opportunities.md`: candidate Avala and Intel Hub / Talent Network training modules; Google or other personal sign-in; optional public/shared profiles, follows and selected achievements; friend challenges, rankings and levels; later subscription features and downloadable/native phone distribution. Personal sign-in is already a pilot dependency, with provider unselected. The social, competitive, commercial and integration features remain later candidates. Keep participation XP distinct from delayed recall, and personal progress private unless the learner explicitly shares it.
