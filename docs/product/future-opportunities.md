# Future opportunities — connected and social learning

Captured from Sam, November 25, 2026. Exploratory product direction, not additions to the current build or authorization to provision/deploy services.

LearnLoop should remain useful as Sam's personalized learning system while keeping open a standalone subscription and a reusable training module in other ASL products. Sam specifically named Avala and Intel Hub / Talent Network as possible connections for industry professionals. These are candidate integrations supplied by Sam, not verified live connections or commitments from those products.

| Possibility | Intended value | Foundation worth preserving now |
| --- | --- | --- |
| Training module for Avala or Intel Hub / Talent Network | Relevant learning alongside another product's workflow | Independent learning core; stable user, set and item IDs; versioned data and explicit access boundaries. Define an actual API/launch/embedding contract with the owning app when needed. |
| Google or another personal sign-in provider | Return across phone and PC with the same saved history | App-owned user identity separated from provider identity and optional profile. Provider choice is open. Signing in does not automatically authorize other connected apps to read learning data. |
| Shareable profiles and learned topics | Show selected achievements and useful learning sets | Optional profile and explicit visibility choices, separate from private answers, notes and review history. Learner chooses what to publish. |
| Follow friends | Discover subjects, shared sets or selected milestones | Treat following and permission to see private content as separate relationships. Activity sharing is voluntary; no social-feed implementation now. |
| Friend challenges, ranking and levels | Encourage practice and friendly knowledge competition | Preserve event type, content revision and attempt timing. Distinguish practice XP/participation from delayed-recall performance; choice success is not proof of knowledge. |
| Subscription features | Support a paid offering if repeated use and demand justify it | Keep feature access separate from personal content ownership and history. Decide paid value after observing use; no billing or paid tier design now. |
| Downloadable phone experience | Convenient regular phone use | Responsive interface, offline-safe progress and portable backend. Evaluate the installable PWA experience on actual Android after approved HTTPS access; consider native/store distribution later if needs justify it. |

## Future decisions, in dependency order

1. Confirm account provider and recovery approach alongside approved hosting; migrate existing progress to a stable owner without loss.
2. Define reusable sets and private progress first. Choose how personal edits, shared-set updates and access revocation behave.
3. Choose one concrete host-product integration and agree identity, content access, data ownership, consent and return-to-app behavior with that product's owner. No shared database access or identity equivalence should be assumed.
4. If profiles/follows are useful in the pilot, define exactly what can be shared and who sees it before adding a feed.
5. Prototype optional challenges only when users want them. Compare like-for-like questions/revisions and conditions for a challenge; label self-graded results accordingly. Keep practice levels separate from a comparative recall score, and allow private, noncompetitive learning.
6. Assess subscription value and native distribution from sustained use. Existing private learning and export should remain understandable regardless of a future commercial model.

The immediate priority remains personal use, practical learning-set creation, private per-user progress, dependable recall and recovery. No social graph, leaderboard, billing, integration framework, provider account, app-store submission or deployment is implemented or authorized by this note.
