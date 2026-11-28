# MVP backlog and release boundaries

November 27: LL-H08 fixed/retested in Chrome: other-tab sign-out closes stale IndexedDB connections; future storage opens anew so the older tab can sign back in without reload. Stale writes are never replayed. Revoked-session denial remains locked after cached-shell offline reload. 43 Windows tests + syntax pass. Real Google form prepared to the mandatory User Data Policy gate; policy/Web-client confirmation pending. No client/secret, live Google callback or deployment created. In-flight-response race and actual Android/HTTPS remain open.

November 26 daily maintenance: clean C: source mirror fast-forwarded to the verified D: recovery milestone without changing the primary SQLite checksum. Active engineering remains on D:. C: has about 6.1 GB free again; browser/provider acceptance was not checked by maintenance. No feature or acceptance status changed.

November 26 local release preparation: LL-H07 implemented/tested. New scripts/prepare-recovery.mjs accepts a trusted normalized SQLite checkpoint into a new destination, retains learning/identity/dedupe data and clears all sessions/OAuth flows. Refuses existing paths, release placement, invalid digests, sidecars/WAL-mode or invalid schemas. Updated backup helper normalizes only its new copy. 43 Windows tests + syntax pass; actual checkpoint recovery receipt follows closeout. C: is full; active source/test work moved by separate copy to the dedicated D: checkout recorded in STATUS.md. No Google client/consent, server change, new job or deployment executed.

November 26 provider update: the user-authorized dedicated Google Cloud project is created, creator Owner role verified and no billing account linked. OAuth client/consent/credentials and actual Google callback remain pending. Private metadata stays ignored; see operations/google-project-choice.md. Earlier no-provider-change statements below describe prior milestones.

| ID | Status / acceptance criterion |
| --- | --- |
| LL-NAME-01 | Later, before wider promotion/subscription/app-store release: choose a distinctive public name after exact/similar web, app-store, domain/handle and relevant trademark checks; record Sam's selection and preserve IDs/progress/export compatibility. LearnLoop remains the working name. Evidence and limits: product/naming.md. This does not block the personal prototype. |

November 26 account-preparation update: two user-selected Google invitations are validated in ignored private configuration. The primary existing library is preserved and the second has an independent local starter library/progress. Account selection is complete for initial testing; Google web-client setup, live enrollment, actual-device verification and server release approval remain open. Real addresses/owner mappings never enter this public backlog.

## Completed local 0.4 identity/security slice; release still held

| ID | Acceptance criterion | Evidence |
| --- | --- | --- |
| LL-H01 | Explicit Google production mode; empty credentials/invitations or unsafe storage fail closed; local mode retains loopback behavior | Config/admission and real pre-start command tests |
| LL-H02 | Expiring browser-bound state, PKCE/nonce, signed token validation, single-use callback; deny uninvited accounts | Signed fixture HTTP/crypto tests |
| LL-H03 | Immutable subject maps to existing library without reseeding; prevent reassignment/cross-owner requests | Real scheduled-history equality, persistence, revocation, action/export/restore tests |
| LL-H04 | Hosted profiles/session picker unavailable; separate Secure/HttpOnly hashed sessions, exact origin/proxy checks, logout and limits | Endpoint/cookie/CSRF/proxy/rate/expiry tests |
| LL-H05 | Verify owner before online cache access; offline consent+expiry+remembered-denial gate; clear device on explicit sign-out | Helper tests and fictional-identity browser walkthrough; final persistence/generation guards need later client smoke |
| LL-H06 | Snapshot before auth tables; failure preserves content; exports omit credentials/identity/session tables | SQLite/backup and migration-admission tests |

38 total tests on Windows and local Ubuntu; software behavior verified, not live Google or production readiness. LL-N02 implementation exists locally; real provider credentials, branding/consent, HTTPS, account/device acceptance and final deploy approval remain open. DNS LL-N01 step was completed by Sam. No host/provider/invitation/job changes executed.


## Completed 0.3 research and usability revision

| ID | Acceptance criterion | Evidence |
| --- | --- | --- |
| LL-R01 | Record evidence and official app patterns, distinguish product claims from research, keep retrieval/application central. | Research report with sources and limits; ADR 005. |
| LL-R02 | Author a single gap with bounded aliases/hint; deterministic normalization and source-linked feedback; no semantic grading or server-stored response. | Pure/domain/API tests and browser alias/authoring walkthrough. |
| LL-R03 | Author 3–8 distinct process steps with an explicit question; move by buttons/keyboard, compare to saved order, show overlap caveat. | Validation/render tests; phone-sized browser ordering via keyboard. |
| LL-R04 | Extra-practice events cannot alter FSRS, stage, item version, daily introductions or delayed-recall metrics. Changed content conflicts; changed schedule alone is harmless. | Tests with both unscheduled and already-scheduled items, stale-content and HTTP checks. |
| LL-R05 | Explicitly install three source-linked examples in a separate set; dedupe and retain original 24. | Unit/API tests; browser install and original-set count. |
| LL-R06 | Save bounded personal pace, pause new ideas at zero, choose guided/recall-first for future introductions; concurrent preferences cannot silently overwrite. | Unit/API tests; browser pause/save and recall-first progression. |
| LL-R07 | Today explains pending/offline/paused states and next time-based returns, shows remaining allowance and work in other sets. | Browser paused/caught-up/return states; source review of global allowance. |
| LL-R08 | View backup JSON and paste it for validated preview/confirmed isolated restore; previous formats remain accepted. | API tests plus complete browser paste → preview → RESTORE → success. Native file saving/chooser remains open. |
| LL-R09 | Corrections preserve unchanged source scope, secondary references and section context; append revision and restart as before. | Source-preservation test; browser format correction (final section-preservation safeguard unit-tested). |

Twenty-eight tests pass across the complete suite. This is software verification, not proof of learning improvement. Original acceptance rows below preserve the baseline; fixed routine/file-only limits are superseded by this section.

## Next local refinements after use

1. Finish actual Android/Chrome, native save/file chooser, light theme, zoom/screen-reader and same-origin offline-tab smoke checks.
2. Time note capture → first usable prompt; reduce authoring friction if it impedes daily use. Acceptance target: one sourced idea saved in under two minutes without coaching.
3. Design undo-last-eligible-grade with explicit event/schedule reversal rules before implementing; do not edit history silently.
4. Consider visual identification for equipment and worked-example → independent calculation practice only when real material needs them.
5. Run the delayed-recall comparison before adding more activity mechanics or growing the content set.


November 25, 2026 · local 0.3 build complete; hosted pilot not approved/deployed

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
| LL-P08 | Every correction creates an immutable revision and resets learning. Old events keep old content/source references; stale attempts cannot grade the new revision. | Domain revision/conflict tests; 0.3 browser format correction observed, final provenance safeguard unit-tested. |
| LL-P09 | Full JSON backup/checksum, atomic validated restore with pre-restore recovery file/new epoch. Content JSON adds review items only and skips identical content. | Server/domain tests and pasted-JSON browser restore. Native download and file chooser still need manual smoke test. |
| LL-P10 | Responsive phone/PC UI, system fonts, focus styles, native controls, reduced motion, no runtime CDN. | Browser phone-sized and desktop walkthrough. 0.3 narrow 305-CSS-pixel Practice view has no overflow; actual Android/zoom/a11y audit remains open. |

## Before first ASL-subdomain pilot

DNS update, November 25: Sam added learn A → 162.35.191.47 with TTL 3600; both authoritative nameservers and 1.1.1.1 independently verified it. LL-N01's DNS-record step is complete. Provider configuration, hosted identity/security, server deployment and recovery remain pending; this DNS update is not deployment approval.

The following is proposed work, not permission to host or invite friends.

**LL-N00 — completed local scope in 0.2: multiple sets and personal ownership.** Explicit local profiles, private learning sets, relational sources/item revisions and per-profile progress/history are implemented. Create/select-set and set-specific manual authoring work. All existing 24 IDs, source scopes, corrections, accepted events, schedules, sessions and dedupe ledger are preserved by tested migration. Eighteen tests pass, including failure rollback, independent progress and restore isolation; browser checks observed set creation/authoring and profile switching. Only private ownership is implemented; shared-set grants remain LL-N03. Local profiles are not secure sign-in; LL-N02 and actual hosted identity are still required before friends access it. No hosted database service was provisioned.

1. **LL-N01 — plan prepared; execution approval open.** Sam selected learn.allstreetlabs.com, Google login and ASL HQ. Read-only DNS/host preflight confirmed 162.35.191.47, active Caddy and available resources/loopback 8830. See operations/asl-hq-deployment-plan.md and review-only deploy/asl-hq/ templates. Dedicated Node 24, hosted identity/security, exact backup destination/cost and release artifact remain to prepare/test; global system Node 18 and HQ apps remain untouched. DNS/server/provider changes still require explicit approval.
2. **LL-N02 — real authentication and per-person ownership.** Remove/disable local session creation in hosted mode. Invitation-only sign-in, no public registration. Every private API and backup is scoped to the authenticated owner; devices cannot choose owner IDs. Acceptance: user A cannot read/export/edit/grade/restore user B's private data through any endpoint, including guessed IDs and conflicts. Two devices for A share A's progress; two different learners do not.
3. **LL-N03 — define shared-set behavior.** Separate reusable learning-set revisions from personal progress and notes. Sharing is explicit; friend's notes/history are private by default. Decide who can publish corrections and how learners accept them. Acceptance: editing a shared set cannot silently change another person's reviewed answer or completed history.
4. **LL-N04 — persistent hosting and recovery.** Test a full restore on an isolated service/storage copy, verify off-machine backups and storage persistence through restarts/releases. No database on ephemeral filesystem. Keep secrets out of the repo. Jobs or paid services require their own authorization.
5. **LL-N05 — actual Android/Chrome test.** Record device, Android/Chrome versions. Verify comfortable typing/aloud self-check, home-screen behavior, reconnect, install/update without losing a draft, and phone Save to Files/restore. Make the full JSON download/file input path demonstrably work; browser automation timed out during its first download check here.
6. **LL-N06 — pilot content review and delayed-recall trial.** Sam reviews 24 answers and the new choice distractors separately from UI. Validate ambiguity, answer-position/length cues, overly obvious options and coverage. Run the small comparison in `validation-plan.md`; refine before expanding the set.

## Deliberately deferred

No certification packs/business, billing, public marketplace or signup; no 120-item expansion goal; no autonomous scraping/content generation, Ziggy runtime dependency, model grader, audio recording/transcription, reminders/jobs, document upload parser/OCR, web extraction, native Android package, graph/hierarchy engine, full offline editing or CRDT. CSV, arbitrary content-schema translation and cosmetic-only correction preservation are useful later. The initial local owner model is not the friends release's access model.

Subscription access and attachment to another ASL product remain possible later outcomes. Prioritize sustained personal learning and small-pilot feedback first; no billing or integration framework is included in the next slice.

## Future opportunity register

See `product/future-opportunities.md`: candidate Avala and Intel Hub / Talent Network training modules; optional public/shared profiles, follows and selected achievements; friend challenges, rankings and levels; later subscription features and downloadable/native phone distribution. Google sign-in is selected for the personal pilot and remains to implement/test; provider configuration is not yet created. The social, competitive, commercial and integration features remain later candidates. Keep participation XP distinct from delayed recall, and personal progress private unless the learner explicitly shares it.

LL-H07 closeout: 43 Windows tests and syntax pass; actual normalized checkpoint → new D: candidate CLI rehearsal passed with original file checksum unchanged, both profile libraries preserved and all restored local sessions cleared. Hosted-session/flow revocation and scheduled history are separately verified in signed/private fixtures. Implementation cd36ff0 was normally pushed and read back; no live restore/deployment was performed.
