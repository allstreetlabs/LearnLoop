# Hosted personal pilot proposal

**Superseded selections:** Sam has now selected learn.allstreetlabs.com, Google login and ASL HQ. Read docs/operations/asl-hq-deployment-plan.md for the verified current IP, read-only host preflight, exact GoDaddy entry and held execution plan. The earlier unselected-host/name statements below are historical. No DNS or deployment approval is implied.

November 25, 2026 · proposed, not deployed or approved for infrastructure changes

## Recommended first release

Use **https://learn.allstreetlabs.com** for LearnLoop, phone and PC on the same origin. Keep LearnLoop as the product name. Start with Sam's account only; add invited friends after per-person access and recovery checks. A subdomain uses the existing ASL domain; no separate domain purchase is needed. Naming remains Sam's decision; learnloop.allstreetlabs.com is an alternative if learn should be reserved for a broader future learning portal.

Recommended topology: Android Chrome / PC browser → HTTPS reverse proxy → one persistent Node 24 LearnLoop process → its private local SQLite database. Keep the PWA and existing scheduler/outbox/conflict model. No separate hosted database or native Android package is needed for this scale. The server handles all database access; phones do not open or synchronize a SQLite file. The PC can be switched off while the hosted app is running.

Prefer an eligible existing ASL host after capacity/isolation/operations checks. No server has been selected or inspected live in this pass. The server inventory contains ASL HQ and Playspace candidates, but inventory entries do not prove spare capacity, acceptable isolation or application recovery. Playspace has documented outstanding off-host/integration gates; do not make LearnLoop depend on its platform readiness. Do not place a learning experiment onto HQ's critical services without host-owner review. A small persistent app host is the fallback, with an explicit price/storage/recovery proposal before purchase.

## Verified facts and limits

- Product working branch was fetched and matched local ed1efacfc6af8a8338f890cbab07cff96ba5841e before this documentation change. Version 0.3 is local-only. Existing 28-test/browser evidence remains as recorded; tests were not rerun for this documentation-only plan.
- Public DNS read on November 25 returned ns73.domaincontrol.com and ns74.domaincontrol.com. A lookup for learn.allstreetlabs.com returned DNS name does not exist. This is a point-in-time observation, not a reservation or GoDaddy-account change.
- Shared origin/master was fetched at ebfa903495e9e78242f6beab834cdef4ab4988fd. Its main-site record describes GoDaddy DNS and Netlify main-site hosting. Its server inventory describes ASL VPS hosts. These are repository records, not fresh authenticated host inspection. The main-site document contains a historical HQ IP that differs from the newer inventory: do not copy its old hq record as a deployment target.
- GitHub connector read the LearnLoop status successfully but returned 404 for the private shared files; authenticated Git fetch/show supplied those records instead. AgenticHQ supplied ThinkTankItem cmwl65dld00014v92tk0dd7rr still returned not_found after one requested authentication retry, correlation 914cfb91-6693-4d00-b47c-75e84c24598a. No duplicate project/task was created.
- No DNS, host, OAuth provider, backup destination, billing, deployment or invitations changed.

## Required engineering and release work

1. **Host preflight and concrete release target.** Read-only check the selected host's identity, Node 24 capability, free resources, existing listeners/proxy, dedicated service identity, persistent local disk, backup facilities and operational ownership. Specify exact app paths/port, restart behavior, deployment artifact, release/rollback commands and any incremental costs. Use one application instance with SQLite initially. No ephemeral disk or network-mounted WAL database.

2. **Real identity and private ownership.** Recommend Google OpenID Connect, restricted to Sam initially. Use only sign-in identity scopes, no Drive/Gmail access. Create a provider-subject → app-owned user mapping, validate tokens/issuer/audience and the chosen flow's state/nonce/PKCE as applicable, and use a server-managed Secure/HttpOnly host-only cookie. Register the exact HTTPS callback and origins for the implementation. Disable local profile enumeration/creation/selection in hosted mode. Default deny uninvited identities. Make logout/offline cache behavior explicit on shared devices. Provider setup/credentials remain outside Git and browser bundles.

3. **Hosted request boundary.** Add an explicit hosted configuration and canonical HTTPS origin/host validation, trusted proxy handling, secure cookies, safe callback exceptions to cookie/origin rules, request limits/rate limits and privacy-preserving operational logs. Do not simply remove the current loopback checks or expose the local profile API. Preserve owner checks on every state/action/export/import/restore/conflict path. Keep app cookies separate from sibling ASL subdomains.

4. **Preserve Sam's library.** Before moving data, sync pending browser work or save device recovery; export/verify a full backup and take a consistent private SQLite checkpoint. Bind the existing local library to Sam's authenticated app user through a reviewed one-time mapping or destination-scoped restore, not a fresh reseed. Verify items/sources/revisions/events/schedules exactly; keep the original local copy and recovery checkpoint. Friends get independent progress later; shared-set correction/publishing can wait.

5. **DNS and HTTPS.** After the exact target and deployment are approved, create only the new learn DNS record in GoDaddy: A to an approved server IPv4, or CNAME to a chosen managed host's instructed target; AAAA only if IPv6 is verified. Configure a dedicated virtual host/TLS certificate and reverse proxy to LearnLoop. Preserve root/www/hq/Intel and unrelated services. Do not expose the database or app's internal port. No registrar or main-site migration is needed.

6. **Durable recovery.** Establish an approved encrypted off-machine backup destination and schedule/owner, retention and failure reporting. Cover SQLite consistency plus deployment/config restoration; keep secrets separate. Demonstrate an isolated restore before normal use. Existing D: checkpoints are useful local recovery, not hosted disaster recovery. New server jobs/provider storage require separate approval.

7. **Phone/PC acceptance.** On Android/Chrome over cellular and a separate PC browser, sign in as Sam and observe the same set/progress. Grade on one, refresh/focus the other and see the acknowledged update; simultaneous stale grades preserve a conflict. Test offline reload/queued recall/reconnect exactly once, draft survival during app updates, backup save/restore on Android, logout/profile isolation and rejection of an uninvited/second user's cross-owner requests. Restart/redeploy without losing data. Verify rollback keeps data compatible. Start with Sam only; invitations come later.

The hosted app will synchronize through accepted server actions, focus/periodic refresh and the existing durable outbox; it is not instant live collaboration. Extra practice remains separate from scheduled recall.

## Approval package and open decisions

Before any infrastructure change present the exact hostname, verified host/provider, cost, DNS record, sign-in flow, file/service/proxy changes, data-migration check, backup job/destination and rollback. Sam approves that concrete package; this proposal is not permission to deploy or provision.

Order of decisions:
1. Accept learn.allstreetlabs.com as the intended name.
2. Select the eligible persistent host after read-only preflight; verify reuse versus incremental paid hosting.
3. Confirm Google sign-in for Sam first and identify the account through a private setup step.
4. Approve the reviewed release and off-machine backup changes. Then run real-device acceptance before inviting friends.

No subscription, leaderboard, social network, certification business, Ziggy pipeline, native app-store release or cross-product integration blocks this personal release.

## Technical references

- [SQLite WAL requirements](https://sqlite.org/wal.html): all database processes on the same host, not a network filesystem.
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect): exact registered callback and validated identity.
- [Caddy HTTPS quick start](https://caddyserver.com/docs/quick-starts/https): DNS and automatic HTTPS, if Caddy is the verified selected host proxy. No proxy choice or installation is assumed.
- [Shared host inventory at checked revision](https://github.com/allstreetlabs/allstreetlabs-shared/blob/ebfa903495e9e78242f6beab834cdef4ab4988fd/procedures/asl-server-inventory.md).
- [Shared ASL site record at checked revision](https://github.com/allstreetlabs/allstreetlabs-shared/blob/ebfa903495e9e78242f6beab834cdef4ab4988fd/projects/asl-online-main-site.md).

