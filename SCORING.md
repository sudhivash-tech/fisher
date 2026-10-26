# Assessment scoring methodology (v0.1)

**These are exploratory indicators from a short custom assessment. They are not validated IQ or EQ tests, are not diagnostic, and do not fix anyone's abilities or career options.**

| Dimension group | Item types | Rule |
|---|---|---|
| Cognitive (logical, numerical, verbal, pattern) | Multiple choice with an answer key | % correct across common items plus the user's stream items (each dimension has 2+ items for science users) |
| Creative problem-solving | 1 scenario (rubric) + 2 self-ratings | Mean of item scores |
| Emotional awareness, empathy, decision/conflict | Situational judgement | Each option has a rubric score 0-3 (3 = most constructive response); score = rubric / 3 x 100. Rubrics are author judgement, not a universal truth. |
| Interests (R, I, A, S, E, C) | 1-5 ratings, own items inspired by Holland's RIASEC | (rating - 1) x 25, averaged per type. Not the validated inventory. |
| Work style (collaboration, structure, uncertainty, learning, responsibility) | 1-5 ratings, one item reverse-scored | Reverse items use 6 - rating |
| Exploration and tool interests | Multi-select | Mapped to SOC major groups and technology categories; used by the recommender as hints, never as restrictions |

- Stream branching: science, commerce and humanities users get 2 stream-specific items each. Undecided/other users get one sampler item from each stream. Stream items add emphasis; they never limit careers.
- Unanswered dimensions score `null`, not 0. Required items must be answered; multi-select items are optional.
- Each dimension has only 2-6 items, so scores are coarse (steps of 25-50 points). Treat them as rough signals.
- Item bank: `public/js/assessment/questions.js`. Scoring: `public/js/assessment/scoring.js`. Tests: `tests/scoring.test.mjs`.
