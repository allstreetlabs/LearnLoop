# Google account, project and client choice

November 26, 2026 · recommendation, not a created provider configuration

Sam asked whether LearnLoop should reuse the account/app used for sign-in elsewhere and explicitly authorized consultation with AgenticHQ Build. Consulted the existing chat **AgenticHQ (A) Build** (019e7d1f-9482-7ea1-be87-0945b01d0da2). Its response is based on recorded HQ evidence, not a new inspection of Google/Auth0 administration. No verified ASL rule requires products to share a project or identity tenant. Do not infer web-login credentials from a server-tool Desktop OAuth client.

Recommended setup:

| Layer | LearnLoop recommendation |
| --- | --- |
| Administrator | Existing ASL-designated Google administrator account; no new Google user is needed. Project custody still needs confirmation. |
| Google Cloud project | Dedicated LearnLoop project, with its own app name, branding and consent configuration. |
| OAuth registration | A new Web application client, named LearnLoop Web, with its own credentials. |
| Redirect URI | https://learn.allstreetlabs.com/auth/google/callback |
| Learners | The two privately selected accounts, each mapped to its own library/progress; administrator ownership and app sign-in permission are separate. |

Google configures consent branding at project level, shared by clients within a project; it recommends separate projects for distinct brands. A future native client for the same LearnLoop brand would use its own platform client. See [Google's project/branding guidance](https://developers.google.com/identity/siwg/best-practices).

Retain the locally implemented direct-Google OIDC approach. A separate application in an existing ASL Auth0 tenant is an alternative only if Sam deliberately chooses shared ASL identity/SSO; it is not a dependency of this personal release. Do not reuse another app's client ID/secret or a Desktop credential for the web callback. Keep existing apps' credentials, callbacks and provider settings untouched.

No Google project/client, consent settings, Auth0 application, access grant, billing or deployment was created. Provider setup, real client/account acceptance, recovery and final release approval remain open. Private account addresses, existing provider ownership details and credentials stay out of this public repository.
