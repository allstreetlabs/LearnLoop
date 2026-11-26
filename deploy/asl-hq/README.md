# ASL HQ configuration for review

These are uninstalled templates for docs/operations/asl-hq-deployment-plan.md. Version 0.4 implements the hosted contract; live provider configuration and deployment still require approval.

- Caddyfile.learnloop: additive top-level site, with explicit proxy client-IP overwrite. Preserve all existing routes; validate/merge against the exact live Caddyfile. Confirm OAuth query redaction in existing logging before use.
- learnloop.service: dedicated identity/data/runtime and resource limits; assert-hosted-ready.mjs now exists and is tested. Actual systemd installation/start and resource behavior remain unverified.
- learnloop.env.example: supported non-secret contract. Empty credentials/accounts fail startup. Supply real allowlist/client values privately; email/sub-to-owner mappings are never public source.
- runtime.json: official Node 24.22.3 Linux x64 candidate digest checked locally; not installed on HQ. Verify target architecture and official artifact again during reviewed preparation.

The local signed-identity test/support/hosted-preview.mjs is fictional QA, never a deployment entry point. No file here authorizes a service, job, proxy reload, OAuth client or host change.
