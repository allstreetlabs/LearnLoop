# 006 — Hosted Google identity with private learning libraries

November 25, 2026 · accepted for local implementation, not deployment

Sam selected learn.allstreetlabs.com, Google login and ASL HQ. Sam added DNS and it was independently verified. The subsequent “ok lets go” authorizes implementing/testing the next build; the explicit hold on Google-provider configuration and server deployment remains.

## Decisions

Use pinned jose 6.2.18 to validate Google's signed identity tokens. Keep fixed Google authorization/token/JWKS endpoints, authorization-code flow, S256 PKCE, random state and nonce. A ten-minute SQLite transaction is bound to a Secure/HttpOnly host-only browser cookie and consumed before token exchange. Reject expired/replayed/duplicate state, wrong signature/algorithm/issuer/audience/authorized party/nonce, unverified email and uninvited identities. Google ID/access tokens and raw callback requests are not logged or persisted; short-lived PKCE/nonce records stay only in the private database until consumed or expired.

A private JSON allowlist maps each invited subject or authoritative Google email to one existing app-owned library. Initial email enrollment is limited to Gmail/verified Workspace identities. Other Google accounts need an explicit stable subject pin. After enrollment, issuer+subject is immutable and unique per owner; an email reassignment cannot attach a different subject to the same library. No public signup, user-selectable owner or silent reseeding. Removing the invitation also denies existing sessions after service configuration reload/restart.

Hosted mode adds auth_identities, hosted_sessions and oauth_transactions only after a consistent pre-auth SQLite snapshot. Library/SQL content schema remains2. Local mode adds no auth tables and preserves legacy sessions. Hosted sessions have separate hashed tokens and a seven-day lifetime; legacy local cookies cannot authenticate remotely. Full JSON learning backups omit identity/session/flow tables; private SQLite recovery must include identity bindings but revoke all sessions and unfinished OAuth flows before returning online.

Use explicit Google mode in production; missing credentials, empty/duplicate invitations, missing library owners or data inside the release fail startup. Listen only on loopback behind the canonical HTTPS host. Trust only loopback proxy traffic, with exact host/protocol/origin checks and Caddy-overwritten client IP. Disable local profile/session endpoints in hosted mode. Apply bounded per-client/login/user limits and timeouts, generic operational errors, HSTS and existing restrictive CSP. The pre-start command validates the real runtime/configuration contract; it does not prove live provider readiness.

## Device privacy and offline behavior

Verify the authenticated owner before opening its device cache online. Offline reopening requires explicit personal-device consent, an unexpired session and no remembered authentication denial. Denial persists until a successful authenticated boot clears it. Late responses from before an account change are rejected. Private caches are not encrypted storage and cannot prevent a person controlling the browser/OS from inspecting them.

Signing out requires pending work to sync first, explicitly explains draft/cache removal, revokes that browser's server session, expires cookies and clears origin cache/storage. A cross-tab signal locks other open app views. A person who intentionally keeps an offline copy may retain access until expiry while offline; the app cannot learn server-side revocation without a connection.

## Validation and consequences

38 tests cover baseline learning/persistence plus signed-identity validation, invitation binding, unchanged existing FSRS history, separate sessions, authorization, replay/expiry, logout, proxy limits, migration failure preservation and actual pre-start refusal. Windows Node 24 and ordinary-user local Ubuntu Node 24 are checked. The browser uses only a local fictional signed-identity fixture; it is not a Google integration test. The fixture is never imported by the production entry point.

Node 24.22.3 Linux x64 archive was SHA-256 checked against the official HTTPS manifest: 4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb. It was unpacked only into the dedicated D: test tree, not ASL HQ. Host architecture/runtime installation, actual systemd/Caddy operation, Google credentials/consent/branding, live TLS, off-machine recovery and real Android remain release gates.

The default PC launch remains local. No OAuth client, server identity/runtime/service/proxy, backup job, invitation or deployment was created. The next approval package must use the reviewed hosted source/runtime, private account configuration and a selected backup destination.

References: [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect), [authoritative email guidance](https://developers.google.com/identity/sign-in/web/backend-auth), [jose verification](https://github.com/panva/jose), [official runtime manifest](https://nodejs.org/dist/v24.22.3/SHASUMS256.txt).
