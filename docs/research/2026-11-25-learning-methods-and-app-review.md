# Learning methods and app review — 0.3 design input

November 25, 2026. Scope: personal learning, subject-specific practice and phone usability. This is a targeted research/documentation pass, not an exhaustive market ranking, paid-app hands-on trial or an efficacy study of LearnLoop. Existing learner data and the original 24-item set are preserved.

## What the evidence supports

[1] Agarwal, Nunes and Blunt's 2021 systematic review found retrieval-practice benefits across varied classroom settings, content and test formats. The authors also note limited representation outside WEIRD countries. This supports retaining retrieval as the core workflow; it does not establish LearnLoop's effectiveness for one adult learning data-center practice. Reviewed the scientific record/abstract through Consensus, not an unavailable full text. [Paper record](https://consensus.app/papers/agarwal-nunes-retrieval-practice-consistently-benefits-student/w:d75ede03-68ab-4a33-86db-d4049f68e80c/).

[2] Pan and Rickard's 2018 meta-analysis found that testing can support transfer, with important variation by task, initial performance and elaborated retrieval. Transfer is not automatic. Keep explanation and unfamiliar application scenarios; remembering a term or arranging provided steps is not equivalent to explaining a new project situation. Reviewed record/abstract, not full text. [Paper record](https://consensus.app/papers/pan-rickard-transfer-of-testenhanced-learning-metaanalytic/w:86b3c8b8-3ed4-49af-8430-48560986f0d3/).

[3] The researcher-led Retrieval Practice guidance describes spacing and successful relearning as retrieving again across time. It supports sensible return visits and feedback rather than a single massed session. The prototype's two-other-questions/ten-minute gate is an implementation policy, not a research-established optimum. FSRS settings remain pinned; personal session limits are preferences, not a claim about optimal memory intervals. [Spacing guidance](https://www.retrievalpractice.org/spacing).

[4] SuperMemo's knowledge-formulation guidance emphasizes understanding, concise items and context before memorization. Treat this as experienced practitioner guidance rather than a controlled evaluation of LearnLoop. Preserve concise prompts, source scope and required ideas instead of turning an entire article into a giant card. [Twenty rules](https://www.super-memory.com/articles/20rules.htm).

## Established apps: documented patterns, not outcome rankings

| Example | Pattern observed in official documentation | Useful adaptation | Boundary |
| --- | --- | --- | --- |
| Anki | Notes/fields, cloze deletion and multiple card formats; authoring guidance favors concise cards. | Optional single-gap format and reusable authored content. | Avoid importing its full configuration/templating complexity into the first phone workflow. [Manual](https://docs.ankiweb.net/manual/editing). |
| Quizlet | Learn uses progressively harder questions; written practice, tests, flashcards and diagrams serve different activities. | Explicit separation of guided introduction, production recall and extra practice. | Product claims are not evidence of superior learning; no AI grader or generated course pipeline added. [Study modes](https://help.quizlet.com/hc/en-us/articles/360030841732-Studying-on-Quizlet). |
| RemNote | Notes can generate basic, cloze and other formats; source context remains near the material. | Author an optional format alongside the main question, with provenance intact. | Do not build a full outline/knowledge-graph editor or assume cloze alone covers application. [Creating flashcards](https://help.remnote.com/en/articles/6025481-creating-flashcards). |
| Duolingo | Short lessons, progression from recognition toward typed responses, and personal settings. | A clear next action, adjustable routine and guided/recall-first introduction. | No activity XP, hearts or streaks presented as knowledge. Its language-course outcomes do not establish effects for this subject. [Official tour](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/). |

No current prices, paid-tier purchases, market-share claims or integrations were needed. A Nature Reviews Psychology spacing/retrieval page was found but its publisher access redirect could not be read; it is not used to support additional detailed claims here.

## Gaps in 0.2 and resulting changes

| Gap | 0.3 response | What to verify |
| --- | --- | --- |
| Fixed three-new/five-minute/ten-attempt routine | Profile preferences for new allowance, session length/attempts and guided versus recall-first introduction. | Bounds, pause-at-zero, concurrent-setting protection, no rewrite of existing schedules. |
| Caught-up state gives an unclear next step | Show next time-based returns, remaining allowance, paused/offline/pending reasons and work in other sets. | Correct labels across time gates, due dates, offline and paused introductions. |
| One presentation for every subject | Optional fill-the-gap and supported process ordering, with three source-linked examples in a separate set. | Format validation, keyboard/touch controls, cues/aliases/hints and source-linked feedback. |
| Recognition could be mistaken for competence | Extra-practice events remain separate and cannot change FSRS, item schedule versions or delayed-recall totals. | Tests prove schedule/history invariants; explicit labels in practice and feedback. |
| Backup download automation repeatedly stalls | Native attachment link plus view/copy JSON and pasted-JSON preview/restore. | Validate the paste path in browser without using download/filechooser event adapters; keep actual native file saving marked unverified until observed. |
| Empty library views and long introductory page | Actionable empty state, shorter Today hierarchy and optional explanation of the learning flow. | Narrow viewport, focus/keyboard behavior, contrast and no answer loss while refreshing. |

## Two additional modes selected

**Fill the gap:** one authored gap for terms/short facts, accepted aliases, optional hint and explicit comparison feedback. Case/whitespace/apostrophe normalization is deterministic; it is not semantic marking. Cued practice may help factual familiarity, but is not evidence of general understanding. No free-text attempt is sent or saved in server history.

**Process ordering:** 3–8 authored steps, arranged with move buttons instead of requiring drag-and-drop. Useful for explicit dependency chains, software workflows and simplified process examples. Provided choices make this supported practice. It never advances scheduled free recall. Real data-center work can overlap; the example explicitly limits its sequence to the stated dependency chain.

These are plausible product experiments, not a research finding that those two interfaces outperform existing free recall. The three optional examples derive from DCF-09, DCF-14 and DCF-18, retaining source locators/scopes. They overlap the original material and must be excluded from an independent assessment/control set. They are draft personal examples, not expert-certified training.

## How to judge the revision

First test software behavior separately from learning benefit: create a format without explanation, complete it on a narrow screen, understand the feedback and next return, preserve pending work, and perform a previewed recovery. Record failures rather than counting feature completion as efficacy.

Then use the existing seven-/21-day time-matched validation plan with parallel free-response/application prompts. Compare required ideas recalled, transfer to unfamiliar scenarios, time and friction. Exclude conflicted/pending attempts, changed revisions and overlapping extra-practice examples from a clean comparison. A personal result is directional, not a product-wide efficacy claim.

Next candidates after use: undo the last eligible grade; clearer quick-capture-to-authoring flow; visual identification/image occlusion for equipment; worked examples followed by independent problem solving for calculations; and broader accessibility/device QA. Audio, model grading, social competition, billing, public accounts and cross-app integration remain separate future decisions.
