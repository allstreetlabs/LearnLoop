# Google account, project and client choice

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
