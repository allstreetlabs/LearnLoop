# Decision 003 — a personal learning system developed through use

November 25, 2026 · direction confirmed by Sam · no new hosting or commercial authorization

LearnLoop should become a system Sam actively uses to learn, build learning sets around his interests, and improve through experience. Its value does not depend on becoming a subscription business. Friends and Facebook friends may join a small pilot once access and private progress are ready; no invitation or external message is sent by this decision.

## Priorities

1. Make personal use comfortable and dependable on Android/Chrome and PC, with shared progress for the same learner.
2. Support several learning sets and low-friction capture, authoring, correction, practice and backup. Keep the first data-center set useful while new subjects are added.
3. Prepare private per-person progress and explicit sharing of learning material. Shared content must never imply shared answers or schedules. Broader Facebook-friend participation should use the same individual accounts and access boundaries as the first invited friends.
4. Improve from actual sessions: where capture is slow, questions are ambiguous, pacing feels wrong, recall fails or a learner does not return. Assess content quality and client usability separately. Do not equate choice accuracy with delayed recall.
5. Consider a subscription or a supplemental feature in another ASL product only after sustained use and demand justify that choice.

## Next proposed build slice

Refactor the one-owner library into explicit users, learning sets/access, versioned items/sources and per-user progress/events. Migrate the 24 items and existing progress without loss. Add set creation/selection and keep authoring practical for Sam. Implement and test access isolation before exposing any hosted pilot. The current local prototype's database already persists data; this is a schema/ownership evolution, not a need to provision a new database service immediately.

Real authentication, approved hosting and tested recovery remain pilot release gates. The user's direction does not authorize infrastructure, spending, deployment, public signup, external invitations, analytics, autonomous jobs or a commercial content pipeline.

## Keep later options inexpensive

Use stable IDs, versioned content, explicit ownership, portable JSON and a learning core separate from the UI and host. These are enough to preserve an eventual subscription or integration path. Do not build billing, a marketplace, product-specific integrations or a general plugin framework before a concrete use case exists. Any future integration must preserve the learner's content ownership, privacy and export path.
