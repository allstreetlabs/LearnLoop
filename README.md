# LearnLoop

## 0.4 hosted preparation

Google sign-in and hosted security are implemented and tested locally. The approved Google pilot registration is saved (dedicated Web client, two test accounts, openid/email); ASL HQ deployment and real callback/device acceptance remain pending. Credentials are protected privately on D:, never in source. Default node server.mjs still opens the existing loopback local library. Hosted mode requires a reviewed Node 24 release, absolute data outside the release, canonical HTTPS origin, private Google client credentials and a nonempty LEARNLOOP_GOOGLE_ACCOUNTS JSON allowlist. Empty or unsafe configuration fails startup. Local profile/session selection is disabled in Google mode.

Google callback: https://learn.allstreetlabs.com/auth/google/callback. Each private invitation specifies one sub OR authoritative Google email plus an existing ownerId. Initial email enrollment works for Gmail/verified Workspace; an external Google email account needs a subject pin. Successful enrollment binds the stable subject to the existing library without resetting it. Real account/client values stay out of Git.

Hosted cache opens online only after authentication. Personal-device offline access is opt-in and session/denial-bound. Sign-out explicitly removes browser cache/drafts after pending work is synced and revokes that browser session. Private browser storage is not encryption. Learning JSON backups omit identities/sessions; private SQLite recovery must revoke restored sessions and unfinished login flows.

38 tests pass on Windows and local Ubuntu, including the real service pre-start guard; browser tests use only a fictional signed-identity fixture. No actual Google login, live TLS, installed HQ service, phone test or off-machine recovery is claimed. See docs/verification.md, ADR 006 and the deployment plan for exact remaining gates. The older local walkthrough below remains valid; its local-profile cautions apply to default local mode.


A quiet personal learning app: review an idea, check understanding, revisit it after a gap, then recall it in your own words. The first set contains 24 source-linked items about how data center projects work.

**Version 0.4.0: local learning plus hosted-authentication preparation.** Canonical repository: https://github.com/allstreetlabs/LearnLoop, working branch `build/local-prototype`. Sam authorized local building/testing/refinement and regular source/status GitHub backups on November 25. Source/documents are backed up on that branch; hosting, deployment and infrastructure remain separately approved steps. Read STATUS.md for active state and exact verification limits.

## Run

Use Node.js **24.x**. Runtime dependencies are pinned `ts-fsrs@5.2.3` and `jose@6.2.18`; the browser has no third-party runtime assets.

```powershell
# From this checkout; dependencies are already installed in the build workspace.
node server.mjs
```

Open **http://127.0.0.1:8830** and choose **Open local library**. Stop with Ctrl+C. On a fresh checkout, run `npm install` first, or `pnpm install --frozen-lockfile` with pnpm 11. A Windows helper, `start-learnloop.ps1`, can find the bundled Codex Node runtime and install the pinned dependency when necessary.

The SQLite database is created on first launch at `data/learnloop.sqlite` and survives restarts. Existing data is never reseeded. Keep this whole data directory private and out of Git. The QA database is separately stored in `data/browser-qa/` and is not used by the normal launch. The delivery archive excludes all runtime data, dependencies and credentials.

Version 0.2 migrates the old one-document library into owner-scoped users, learning sets, sources, items/revisions, progress, events, conflicts and drafts. A consistent `before-schema-2-*.sqlite` snapshot is saved before migrating a legacy database. Migration preserves existing IDs, history and schedules. Never replace an existing database with a fresh seed to upgrade.

## Try it

1. Start a short session. Read an answer and its source context, then mark it reviewed.
2. Answer a choice question. Two other graded questions or ten minutes must intervene before its next check. Correct first and repeated checks unlock production recall, after another gap.
3. Type an answer, say it aloud, or choose **I don’t know yet**. Reveal the reference answer and check which required ideas you retrieved. Missing or guessed ideas require **Again**. Hard, Good and Easy require complete recall.
4. Return when due. Only production recall changes the FSRS schedule. Recognition is recorded separately; it does not count as recall mastery.
5. Add a note or passage, with an optional HTTP/HTTPS source link. Save it for later, or create a prompt, answer and 1–3 required ideas. Manually authored items go from Review into free recall; the 24 starter items have authored choice checks.
6. Try **Practice → Add source-linked examples** for two fill-the-gap exercises and a simplified process-ordering chain in a separate optional set. The original 24 stay intact. Extra practice never advances FSRS or delayed-recall totals. Author your own format in the collapsed **Extra practice format** section of an item.
7. Choose **Adjust pace** on Today or Data: 0–10 new ideas/day (zero pauses introductions), 3–15 minutes, 3–20 attempts, guided or recall-first introductions. Defaults remain 3/5/10/guided. Recall first affects future introductions, without rewriting existing stages or return times.
8. Use **Data** to export a full backup, preview content, or restore. **View / copy backup JSON** and **Or paste JSON for preview** provide another recovery path; restore still requires validated preview and typing RESTORE. Verify any downloaded file exists. Opening a download or copying text is not proof of a safely stored backup.

Use **Manage sets** from Today or Library to create a subject, then select it before adding material. Practice and Library respect the selected set; daily introduction limits remain shared across all sets in the profile. Data → **Local profiles** lets you test a separate learner library and switch back. Each new local profile starts with its own starter set. These are local development profiles, not Google accounts or access protection against another person using the same computer. The picker and local session endpoint must be replaced before hosting.

By default there are three new introductions per library calendar day (`America/Chicago`), shared across sessions. Due recall comes first. Session limits apply when moving to the next question, so an answer is never cut off. Today shows upcoming time-based returns, remaining allowance and pending/offline/paused reasons. Browsing source-backed answers in Library is unrestricted and does not advance a grade.

## Shared progress and offline use

Two browser sessions using the same profile on this running server share that profile's library. Different profiles have separate sets, notes and progress. A cookie-bound owner scopes every private API; request-supplied owner IDs cannot select another library. Browser caches, outboxes, editor drafts and attempted answers are keyed by profile. Changing the local profile in another tab pauses the old tab instead of mixing its pending work. The app refreshes on focus and every 15 seconds while visible. This is not cross-device hosting: an Android phone cannot reach this PC's loopback address.

After an online visit, the app shell and downloaded library are available offline. Previously downloaded **due recall** and optional extra practice can be graded into a durable IndexedDB outbox. An attempt stays visibly pending until the server acknowledges it; an item with pending work cannot be graded again locally. New introductions and item edits wait for a connection; note capture can remain pending offline. Repeated delivery of one action creates one event. Stale simultaneous attempts are preserved as conflicts and do not silently replace the shared schedule.

Typed attempts remain in the device's in-progress draft only and are cleared after grading. They are not sent to the server, placed in backups, or included in review history. No audio is recorded and no semantic auto-grader is used. Device recovery files include cached library, pending actions and unsaved editor content; they are a manual reconciliation format, not full-backup restore files.

## Boundaries

This server deliberately binds only `127.0.0.1`. **Open local library** creates a local owner session protected by an HttpOnly/SameSite cookie and same-origin mutation checks. It is a convenience for one computer, not an internet identity system. Do not expose this server using a tunnel, proxy, `0.0.0.0`, or an ASL subdomain as-is.

Sam's next direction is an **ASL subdomain and a small friend pilot**, developed while using it. Before that release: approve the host/subdomain, add real sign-in and invitation-only access, separate each person's answers/progress, test ownership on every API, and establish persistent storage plus tested off-machine backups. Learning sets may be shared; personal history must remain private. See [the pilot backlog](docs/backlog.md). No certification business, billing, public signup, Ziggy dependency or Playspace assumption is part of this build.

## Verification and handoff

```powershell
node --test test/*.test.mjs
node --check server.mjs
node --check lib/domain.mjs
node --check public/app.js
node --check public/sw.js
```

See [architecture](docs/architecture/overview.md), [decisions](docs/decisions/002-local-staged-prototype.md), [QA evidence and limits](docs/verification.md), [backlog](docs/backlog.md), [validation plan](docs/validation-plan.md) and [build handoff](docs/handoff.md).

Source/status continuity is checked daily by the authorized heartbeat and at material build milestones. See [backup procedure](docs/operations/continuity-and-backups.md). Private recovery copies go to `D:\Codex\LearnLoop\backups`, not Git. The daily maintenance is not an unattended development service or a hosting deployment. Twenty-eight automated tests pass. Browser checks observed both extra modes, format authoring, preferences, offline queued practice/reconnect and pasted-JSON restore. Native file saving/chooser, actual Android and broader accessibility checks remain open. New backups use schema 3 and accept earlier schema 1/2 files. No database migration is needed for 0.3.

The [research and revision report](docs/research/2026-11-25-learning-methods-and-app-review.md) compares official app documentation and learning-method evidence. The new modes are product experiments, not proof of improved recall. Their three examples overlap the starter material; exclude them from independent control/assessment sets.

The content is a personal prototype, not an expert-reviewed qualification or site work instruction. Source scopes and dates remain visible. The original review file is preserved unchanged in `content/data-center-flow.v0.1.json`; Sam's build instruction authorizes its use here. New choice checks in `content/choices.json` are draft additions needing usability and content review separately.

## November 26 local recovery tool

`scripts/prepare-recovery.mjs` now provides a non-overwriting, checksum/integrity-checked recovery candidate with retained library/identity mappings and revoked sessions/unfinished OAuth flows. Read docs/operations/private-sqlite-recovery.md before using it. It does not deploy or restore over the running service. The backup helper now produces a self-contained new SQLite checkpoint; original runtime data is opened read-only.
