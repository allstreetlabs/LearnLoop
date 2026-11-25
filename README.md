# LearnLoop

A quiet personal learning app: review an idea, check understanding, revisit it after a gap, then recall it in your own words. The first set contains 24 source-linked items about how data center projects work.

**Local prototype, 0.1.0.** Canonical repository: https://github.com/allstreetlabs/LearnLoop. Sam authorized implementation on November 24, 2026. Hosting, deployment, infrastructure and publishing remain separately approved steps. This checkout has not been pushed or deployed.

## Run

Use Node.js **24.x**. The only runtime dependency is pinned `ts-fsrs@5.2.3`; the browser has no third-party runtime assets.

```powershell
# From this checkout; dependencies are already installed in the build workspace.
node server.mjs
```

Open **http://127.0.0.1:8830** and choose **Open local library**. Stop with Ctrl+C. On a fresh checkout, run `npm install` first, or `pnpm install --frozen-lockfile` with pnpm 11. A Windows helper, `start-learnloop.ps1`, can find the bundled Codex Node runtime and install the pinned dependency when necessary.

The SQLite database is created on first launch at `data/learnloop.sqlite` and survives restarts. Existing data is never reseeded. Keep this whole data directory private and out of Git. The QA database is separately stored in `data/browser-qa/` and is not used by the normal launch. The delivery archive excludes all runtime data, dependencies and credentials.

## Try it

1. Start a short session. Read an answer and its source context, then mark it reviewed.
2. Answer a choice question. Two other graded questions or ten minutes must intervene before its next check. Correct first and repeated checks unlock production recall, after another gap.
3. Type an answer, say it aloud, or choose **I don’t know yet**. Reveal the reference answer and check which required ideas you retrieved. Missing or guessed ideas require **Again**. Hard, Good and Easy require complete recall.
4. Return when due. Only production recall changes the FSRS schedule. Recognition is recorded separately; it does not count as recall mastery.
5. Add a note or passage, with an optional HTTP/HTTPS source link. Save it for later, or create a prompt, answer and 1–3 required ideas. Manually authored items go from Review into free recall; the 24 starter items have authored choice checks.
6. Use **Data** to export a full backup, preview a content import, or restore a backup. Verify the downloaded file exists. A download opening is not proof of a safely stored backup.

There are three new introductions per library calendar day (`America/Chicago`), shared across sessions. Due recall comes first. A session ends at ten practice attempts or after five minutes when moving to the next item. Browsing source-backed answers in Library is unrestricted and does not advance a grade.

## Shared progress and offline use

Two browser sessions using this same running server read one shared database. Independent browser storage at `localhost:8830` and `127.0.0.1:8830` was used to test this. The app refreshes on focus and every 15 seconds while visible. This is not cross-device hosting: an Android phone cannot reach this PC's loopback address.

After an online visit, the app shell and downloaded library are available offline. Previously downloaded **due recall** can be graded into a durable IndexedDB outbox. An attempt stays visibly pending until the server acknowledges it; an item with pending work cannot be graded again locally. New introductions and item edits wait for a connection; note capture can remain pending offline. Repeated delivery of one action creates one event. Stale simultaneous attempts are preserved as conflicts and do not silently replace the shared schedule.

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

The content is a personal prototype, not an expert-reviewed qualification or site work instruction. Source scopes and dates remain visible. The original review file is preserved unchanged in `content/data-center-flow.v0.1.json`; Sam's build instruction authorizes its use here. New choice checks in `content/choices.json` are draft additions needing usability and content review separately.
