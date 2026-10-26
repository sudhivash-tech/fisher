# Test report

Run: `npm test` (Node built-in test runner, no dependencies). Result of the last run: **32 passed, 0 failed, 32 total.**

## Tests executed
- home links to the assessment
- assessment: onboarding, validation message, stream branching, review
- end to end: answers -> scores -> recommendations -> results, career and skill pages
- course cards escape HTML and flag truncated links
- course filtering: English default, level and price filters
- profile page and about page render
- chatbot: grounded answers, honest fallbacks
- csv: quotes, embedded newlines, BOM, CRLF
- csv: malformed and missing-column inputs fail loudly
- price parsing
- phrase matching respects word boundaries
- every raw skill row survives into the per-occupation files
- courses: no duplicate URLs or ids; two datasets joined only on title match
- skill->course: ids exist, text evidence required, max 6, no duplicates, nothing invented
- matched reasons are reproducible from course text
- categories with no evidence return empty rather than filler
- norm
- config has a profile for every SOC group present in the data
- recommendations come from the dataset, are sorted, capped per group, and meet the minimum data rule
- different profiles give different recommendations
- weights are configurable without code changes
- explore choice adds a visible, explained bonus; stream never filters
- sparse data: no answers gives no recommendations; tiny index gives fewer than topN
- tool interest changes within-group ordering
- item bank integrity
- stream branching
- objective scoring uses answer keys; subjective uses rubric; reverse items flip
- best vs worst answers produce 100 vs 0 on every scored dimension
- validation flags missing required answers; multi-select is optional
- unanswered dimensions are null, not zero
- multi-select answers map to SOC groups and tool hints
- different answers change the profile

## Not tested (be honest about gaps)
- **Browser rendering and layout (desktop and mobile), keyboard navigation, focus states, colour contrast, console errors.** No browser was available. View functions are tested as HTML strings only; the standalone bundle was smoke-loaded in a Node VM with stubbed DOM.
- **The Netlify function and the AI model integration.** Code is written but was never run against Netlify or an AI API (no network, no key). Retrieval answers are tested; `mode: "ai"` is untested.
- **Course URL validity** (no network). 197 URLs are flagged as possibly truncated.
- Assessment question quality and rubrics (author judgement; not psychometrically validated).
- Completion rates and usability with real users.
