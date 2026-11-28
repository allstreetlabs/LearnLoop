# ASL HQ deployment plan — LearnLoop personal pilot

**November 27 approved provider registration completed:** policy accepted; dedicated LearnLoop Web client saved/enabled with the exact HTTPS callback, External/Testing audience and two selected test users. Only openid/email identity scope is declared/requested. Private credentials are encrypted on D: and not installed on HQ. This supersedes earlier project/client/consent setup holds only. No public publishing, real sign-in, server deployment or backup job was performed; server/recovery/device acceptance and final execution approval remain open. See google-project-choice.md and the current handoff.

**November 26 authorized project creation:** Sam subsequently authorized creating a dedicated Google Cloud project. Created and verified with the intended administrator's Owner role and no linked billing account. Exact private metadata is in data/deployment/google-project.json. This supersedes the earlier project-creation hold below only. OAuth client/credential/consent configuration, real sign-in and ASL HQ deployment remain pending. LearnLoop is a working name; see ../product/naming.md before wider promotion. No selected domain or app data was changed.

**November 26 project recommendation:** after Sam-authorized consultation with AgenticHQ (A) Build, prefer a dedicated LearnLoop Google Cloud project and Web OAuth client administered by an existing ASL-designated Google account. Preserve the direct-Google implementation. See google-project-choice.md for the distinction between administrator, project, client and learner accounts. This supersedes earlier generic suggestions to select/reuse an existing Google project; creation/custody/provider changes remain unapproved and unexecuted.

**November 26 account update:** Sam selected two sign-in accounts for primary/secondary profile testing. Ignored data/deployment/google-accounts.json contains their private mappings to distinct existing local owners. The second owner now has an independent 24-item starter set; the primary library was hash-compared unchanged. Do not publish the account list. Google project/client configuration, consent/branding, actual sign-in and server deployment remain separate pending steps; this private preparation is not live enrollment or deployment approval.

## Implementation checkpoint — 0.4, November 25

The hosted identity/security implementation and pre-start guard now exist locally; 38 Windows/local-Ubuntu tests pass. Draft config now uses LEARNLOOP_GOOGLE_ACCOUNTS, a JSON allowlist (one subject or authoritative email plus existing ownerId), rather than the earlier subject-list placeholder. See ADR 006 and verification. Google/provider credentials, first private account, actual callback/branding/TLS, final client smoke and off-machine recovery remain open; deployment is still not authorized.

Runtime candidate is Node 24.22.3 Linux x64, with official manifest SHA256 pinned in deploy/asl-hq/runtime.json. The archive was used only in the dedicated D: local-test tree. Recheck HQ architecture and pinned identity before any install. Do not change HQ's global Node 18.

The Caddy fragment now overwrites X-Forwarded-For with {remote_host} to match the app's single-IP trust contract. Before routing, verify that existing Caddy access/error logging omits/redacts OAuth callback query credentials; the app itself never logs raw requests/tokens. Actual Caddy reload/systemd/resource acceptance remains pending.

First hosted startup snapshots SQLite before creating auth tables. For private full-SQLite disaster recovery, preserve auth_identities but revoke all hosted_sessions and oauth_transactions before resuming online; do not revive old sessions from a recovery snapshot. Learning JSON export includes no identity/session records.


November 25, 2026 · deployment state: PLANNED, NOT APPROVED TO EXECUTE

**DNS milestone:** Sam subsequently added the GoDaddy A record. Read-only verification against ns73.domaincontrol.com, ns74.domaincontrol.com and 1.1.1.1 returned learn.allstreetlabs.com → 162.35.191.47, TTL 3600 on November 25. DNS is complete; the earlier absent-record observations/held DNS-save steps below describe the pre-change plan. Remaining server, Google-provider, backup-job and deployment actions are still held. DNS acceptance alone does not verify HTTPS, sign-in or the application.

## Confirmed direction and authority

Sam selected learn.allstreetlabs.com, Google login and the ASL HQ server. This authorizes planning and existing local build/read-only work, not DNS edits, server writes, OAuth/provider configuration, deployment, new backup jobs or invitations. Source/status branch backups remain authorized. This plan supersedes the host/provider/name choices in hosted-personal-pilot.md.

Release topology: Android/PC browser → https://learn.allstreetlabs.com → existing HQ Caddy → 127.0.0.1:8830 → dedicated LearnLoop Node 24 process → private SQLite under /var/lib/learnloop. One app instance, Sam only initially. No dependency on Playspace, no separate database service, no shared HQ database or account.

## Evidence checked in this pass

| Check | Result / limit |
| --- | --- |
| Product remote | Fetched build/local-prototype; local and remote both 0e910f62e121083873ce744154687a50f00e3ae0 before this plan commit |
| Shared procedures | Fetched origin/master ebfa903495e9e78242f6beab834cdef4ab4988fd; current inventory lists HQ at 162.35.191.47 |
| Public DNS | hq.allstreetlabs.com A = 162.35.191.47; learn A/AAAA absent; apex A = 75.2.60.5 (main site, not the app target) |
| CAA | Apex has no CAA data; learn does not exist. No CAA change presently indicated; recheck before issuing certificate |
| Authenticated host | Strict IP-specific known-host verification and existing sam key; hostname asl-hq, Linux 6.8.0-142-generic. No sudo or writes used |
| Capacity snapshot | About 3995 MiB available RAM, 90 GiB free root disk, low load. Snapshot only; recheck before execution |
| Runtime/proxy | /usr/bin/node v18.19.1; Caddy v2.11.3 active; AgenticHQ active. Node 24 must be isolated, not a system/HQ runtime replacement |
| Proposed namespace | No learnloop passwd entry and no /opt/learnloop, /etc/learnloop or /var/lib/learnloop paths returned; loopback port 8830 unused at observation, not reserved |
| Caddy structure | /etc/caddy/Caddyfile readable, root-owned, 4137 bytes. Observed import is an existing nested agent-auth route, not a global LearnLoop include. Do not place files in an assumed automatically loaded conf.d |
| HQ operational lineage | Exact ThinkTankItem cmwl65dld00014v92tk0dd7rr returned not_found after requested auth retry, correlation 011ad9cc-196f-45f0-8bce-c105c6dfd4e8. No duplicate record created |

The local asl-hq SSH alias and older HQ build/access procedures point to retired 162.245.191.94. They were not used or edited. The known-host entry for the hostname also differs from the current IP-specific pin; no key was accepted/replaced and no check was bypassed. Use the independently pinned current IP until the owning infrastructure lane reconciles those records.

## Exact GoDaddy entry — for later approval

In GoDaddy, open allstreetlabs.com → DNS → Add New Record:

| Field | Value |
| --- | --- |
| Type | A |
| Name / Host | learn |
| Value / Points to | 162.35.191.47 |
| TTL | 1 hour (3600 seconds) |

Only this web-routing record is needed. Enter learn, without the full domain, scheme, port or path. Do not add a CNAME or AAAA for learn, forwarding, wildcard, MX change or new nameservers. No www.learn hostname is planned. Preserve root/www/hq/Intel and all unrelated records. Google may request an ownership-verification TXT value separately; only Google can supply that exact value, so none is invented here.

Hold the DNS save until separately approved and the reviewed HTTPS route is ready. DNS alone will not make the current local prototype usable. Never test by exposing the unauthenticated local picker.

## Planned Google client — not created

- Web application, application name LearnLoop; authorized domain allstreetlabs.com.
- Server redirect flow with callback **https://learn.allstreetlabs.com/auth/google/callback** (proposed implementation contract, not an existing route).
- Homepage **https://learn.allstreetlabs.com**. No Authorized JavaScript Origins are required for the proposed server-only redirect flow; if Google Identity Services browser integration is selected later, add that exact HTTPS origin and revise tests.
- Basic identity scopes openid and email; no Drive/Gmail access or refresh-token/offline Google API access.
- Use state, nonce, PKCE S256 and verified issuer/audience/signature/expiry; map Google issuer+sub to the app-owned user. Restrict to Sam's verified account first, then approved invitees. An empty allowlist must deny sign-in.
- Select/verify the existing ASL Google project, consent audience/test-user settings and Sam's intended account through a private setup step. App-level allowlisting remains required regardless of provider audience. Client credentials stay in protected server configuration, never Git/chat/browser bundles.

Exact redirect matching and subject identity follow [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect). Provider setup and any terms/consent administration remain approval-gated.

## Proposed host changes and file ownership

| Resource | Proposed scope |
| --- | --- |
| Identity | New non-login learnloop user/group, no sudo, no HQ/Seren credential access |
| Releases | /opt/learnloop/releases/<reviewed-commit>, root-owned/read-only; /opt/learnloop/current symlink |
| Runtime | /opt/learnloop/runtime/node24/bin/node, dedicated verified Node 24 binary pinned by version/digest in release receipt; leave /usr/bin/node and other app runtimes alone |
| Private data | /var/lib/learnloop, learnloop-owned 0700; SQLite and private pre-restore recovery files outside releases |
| Credentials | /etc/learnloop/learnloop.env, root:learnloop 0640; directory 0750; secret values supplied privately |
| Service | /etc/systemd/system/learnloop.service; loopback-only 8830, automatic restart, sandbox/resource limits after Linux verification |
| HTTPS | Append only the reviewed LearnLoop virtual-host block to a backed-up /etc/caddy/Caddyfile; validate complete config then reload existing Caddy |
| Recovery | Approved encrypted off-machine backup destination, retention, job owner and restored-copy evidence; exact destination still unselected |

Draft service/Caddy/environment contracts are in deploy/asl-hq/. They are review artifacts, not installed or validated live. The service deliberately requires a hosted-readiness assertion script absent in 0.3. No global Node upgrade, firewall opening for 8830, database port, HQ restart, root/www DNS change or modification of other virtual hosts is planned.

No new host purchase is planned. Incremental backup/storage/provider cost is not verified and must be presented before spending. Existing hosting fees are not a verified zero-increment cost guarantee.

## Implementation and acceptance before release approval

1. Implement hosted mode and Google identity locally. Current 0.3 lacks them. Canonical HTTPS host/origin, trusted loopback proxy, __Host-learnloop Secure/HttpOnly/SameSite=Lax session, same-origin mutation checks, login/logout, rate limits and safe operational errors/logging. Redact callback query codes/tokens; preserve the current restrictive client CSP. Disable profile enumeration/creation/selection in hosted mode. Public readiness reveals no learner data; protected APIs require identity.
2. Test signed identity validation, state/nonce/PKCE expiry/reuse, uninvited denial, forged owner IDs and all cross-owner read/export/import/restore/conflict operations. Verify logout/offline-cache treatment on a shared device. Keep local mode loopback-only.
3. Package an immutable reviewed commit and dependency lock; verify official Node 24 archive/checksum and Linux support. Run the complete meaningful suite and Linux service/readiness checks. Final artifact digest and exact runtime version become the execution receipt; 0.3/ed1efac is not an approved hosted release.
4. Sync Sam's browser outbox or preserve device recovery. Take/verify private JSON and consistent SQLite backups before mapping the existing library to Sam's Google-linked app user. Compare every item/source/revision/event/schedule and accepted-action policy; never silently seed over existing work. Keep the original PC copy. Freeze local writes at cutover so phone/PC use the hosted origin afterward.
5. Test an isolated restore using the proposed server backup format. Suggested initial recovery targets for approval: daily backup plus before each release, maximum 24-hour loss between backups, restore within one working day. Select exact storage, encryption custody, retention and failure notification before authorizing any job.

Source/persistence tests from 0.3 remain 28 passing as recorded. This pass changes only documentation and draft configurations; it does not establish hosted auth, Linux service, certificate or Android acceptance.

## Ordered execution window — all actions held

After a hosted-enabled release, credentials, backup destination and exact changes are reviewed, obtain Sam's explicit approval for the relevant operations:

1. Recheck pinned HQ identity, resources/port and existing config hashes. Snapshot only the touched config/data; capture baseline HQ and other public-site health. Check for concurrent changes before every replacement.
2. Create the isolated identity/runtime/directories and install the immutable release/config/unit. Import/map the private library using the reviewed procedure; verify counts and history; start and smoke test the loopback service. No public route yet.
3. Prepare/validate the additive Caddy change, including certificate challenge/CAA reachability and existing-site regression checks. Approve the DNS save and public route together. Publish the A record, read it back from authoritative DNS, then reload Caddy and verify valid HTTPS before enabling normal use. Do not weaken TLS or use a browser certificate-warning bypass.
4. Sam signs in on Android/Chrome over cellular and PC with the same Google identity. Grade on either device; the other shows accepted state on refresh/focus. Verify simultaneous stale grades preserve conflicts, offline reload/queued recall/reconnect accepts once, drafts survive update, backup saves/restores, and restart preserves data. Confirm unauthenticated/uninvited/cross-owner access is denied.
5. Record final app/runtime/config digests, DNS/TLS/readiness/owner/migration/recovery checks, HQ lineage when reconciled, operator and rollback reference. Sam only initially; friend invitations are later authorization.

## Rollback

If preparation fails before routing, stop only LearnLoop and retain its private data/checkpoints; restore any touched Caddy preimage only if its expected hash still matches. If public release fails, remove only the new virtual-host block with a reviewed, hash-checked merge, validate/reload Caddy, stop LearnLoop and revert only the new learn DNS record when approved. Existing HQ services remain running.

Switch app release symlink back only when data schema/auth migration is compatible. Otherwise stop writes and use the verified pre-migration copy through an explicit recovery decision: restoring an older backup loses newer accepted progress. Preserve that newer database and browser pending actions before recovery. Never delete private data, blindly overwrite a concurrently edited shared Caddyfile, or assume a backup reversal merges user progress.

## Remaining inputs

- Sam's Google account and the ASL Google project/credential custodian (private setup).
- Reviewed hosted-enabled source/runtime artifact and Linux/auth tests.
- Exact off-machine backup destination, cost, retention and new-job approval.
- Final approval for the concrete server, OAuth, DNS, route and backup changes.

References: [GoDaddy A records](https://www.godaddy.com/help/add-an-a-record-19238), [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https), [checked shared inventory](https://github.com/allstreetlabs/allstreetlabs-shared/blob/ebfa903495e9e78242f6beab834cdef4ab4988fd/procedures/asl-server-inventory.md).

