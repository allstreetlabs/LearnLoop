# ASL HQ draft configuration

These are review-only templates for docs/operations/asl-hq-deployment-plan.md. They are not installed, live-validated or deployment approval. Current 0.3 cannot be hosted securely with these files alone.

- Caddyfile.learnloop: additive top-level virtual-host fragment, not a complete HQ config. Current HQ has a nested agent-auth import; no global conf.d inclusion is assumed.
- learnloop.service: dedicated identity/data/runtime with proposed resource limits. Linux service validation is pending. The readiness assertion deliberately references a script absent in 0.3; implement/test that fail-closed guard in the hosted release.
- learnloop.env.example: non-secret future configuration contract. Empty identity/credential values must deny startup/sign-in. The current local server does not implement this contract.

Review the final config and app/runtime artifact digests before approval. Do not install a service, start a new job, reload Caddy, create OAuth credentials or edit DNS from this directory automatically.

