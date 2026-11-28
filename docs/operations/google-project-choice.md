# Google account, project and client choice

## Current saved setup — November 27

User explicitly approved the policy and dedicated Web client. Policy accepted and OAuth configuration created as LearnLoop (ASL pilot). LearnLoop Web is enabled with one redirect https://learn.allstreetlabs.com/auth/google/callback, no JavaScript origins and no AI-agent flag. Audience is External/Testing with exactly the two selected test accounts. Data Access declares only openid and https://www.googleapis.com/auth/userinfo.email; sensitive/restricted lists are empty. App requests openid/email. No public publishing or billing action.

The private client credential is DPAPI CurrentUser encrypted under D:/Codex/LearnLoop/private/deployment, with verified readback and a hash-checked local encrypted checkpoint. Temporary plaintext was removed. Never copy account identifiers, credential values or screenshots to Git. Decryption requires the originating Windows user profile; reviewed Linux credential transfer and off-machine recovery remain release tasks. Actual client/invitation configuration validated locally without app startup or Google requests. No real Google login/callback or deployment is claimed.

The recommendation below is now implemented at provider-registration level. All earlier pending-policy/no-client descriptions are historical; deployment/publication still need their separate approvals.

## Historical preparation and recommendation

November 27 live setup: app name LearnLoop (ASL pilot), administrator support/developer contact and External/testing audience prepared in the console. Finish requires the Google API Services User Data Policy agreement. The checkbox remains unchecked and Create unsubmitted pending specific policy/Web-client approval. No OAuth client or secret exists from this work. Planned Web client remains server-only with https://learn.allstreetlabs.com/auth/google/callback and openid/email. This is preparation, not deployed login.

November 26, 2026 · dedicated project created; OAuth registration pending

Sam explicitly authorized browser creation of a separate project under the existing signed-in Google account. A visible-project search found no LearnLoop match. The dedicated project was then created and selected successfully; read-only IAM confirms the intended administrator has Owner (Legacy), and Billing states there is no linked billing account. Exact account, project ID/number and observation URLs are in ignored data/deployment/google-project.json. No OAuth client, secret, consent setup, billing link or application deployment was created. The following recommendation now governs the remaining client setup.

LearnLoop remains an internal working name. Sam flagged existing learning sites; a focused check confirmed overlap. See ../product/naming.md. An eventual public-brand change does not require rebuilding the project or changing learner IDs/progress.

Sam asked whether LearnLoop should reuse the account/app used for sign-in elsewhere and explicitly authorized consultation with AgenticHQ Build. Consulted the existing chat **AgenticHQ (A) Build** (019e7d1f-9482-7ea1-be87-0945b01d0da2). Its response is based on recorded HQ evidence, not a new inspection of Google/Auth0 administration. No verified ASL rule requires products to share a project or identity tenant. Do not infer web-login credentials from a server-tool Desktop OAuth client.

Recommended setup:

| Layer | LearnLoop recommendation |
| --- | --- |
| Administrator | Existing ASL-designated Google administrator account; project Owner role verified in the live IAM console. No new Google user was created. |
| Google Cloud project | Dedicated LearnLoop project, with its own app name, branding and consent configuration. |
| OAuth registration | A new Web application client, named LearnLoop Web, with its own credentials. |
| Redirect URI | https://learn.allstreetlabs.com/auth/google/callback |
| Learners | The two privately selected accounts, each mapped to its own library/progress; administrator ownership and app sign-in permission are separate. |

Google configures consent branding at project level, shared by clients within a project; it recommends separate projects for distinct brands. A future native client for the same LearnLoop brand would use its own platform client. See [Google's project/branding guidance](https://developers.google.com/identity/siwg/best-practices).

Retain the locally implemented direct-Google OIDC approach. A separate application in an existing ASL Auth0 tenant is an alternative only if Sam deliberately chooses shared ASL identity/SSO; it is not a dependency of this personal release. Do not reuse another app's client ID/secret or a Desktop credential for the web callback. Keep existing apps' credentials, callbacks and provider settings untouched.

Only the dedicated project was created, with its default creator ownership. No OAuth client, consent settings, Auth0 application, additional access grant, billing link or deployment was created. Remaining provider setup, real client/account acceptance, recovery and final release approval remain open. Private account addresses, provider ownership details and credentials stay out of this public repository.
