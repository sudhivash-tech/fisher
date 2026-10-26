# Data dictionary

Raw files are in `data/raw/` and are never modified. `npm run build:data` writes derived JSON to `public/data/` and a machine-readable `quality-report.json`.

## Source files
| File | What it is | Key columns | Rows |
|---|---|---|---|
| software_skills.csv | O*NET Technology Skills: software/tools per occupation | O*NET-SOC Code, Title, Element Name (technology category = "skill" in Novigo), Workplace Example (product), Hot Technology (Y/N), In Demand (Y/N) | 31821 (923 occupations) |
| job_titles.csv | O*NET alternate job titles | O*NET-SOC Code, Title, Job Title, Source(s) | 54269 (1016 occupations) |
| edx_courses.csv | edX catalogue snapshot (2020) | title, summary, institution, course_url, Level, subject, price, language, n_enrolled, course_effort, course_length, course_description | 975 |
| appendix.csv | MITx/HarvardX participation statistics, 2012-2015 | Course Title, Participants (Course Content Accessed), Certified, Launch Date | 290 |

## Relationships
- software_skills <-> job_titles: join on `O*NET-SOC Code`. Every skills code exists in job_titles; 93 occupations have titles but no technology records and are never recommended.
- Occupation -> skill: an occupation's `Element Name` values (categories); each category contains products. The same category appears across many occupations.
- Skill category -> courses: **inferred**. `config/skill-course-crosswalk.json` (hand-written keywords) plus direct product-name matches in course text. A course needs a text match to qualify; subject alone never does. Output: `public/data/skill-courses.json` (up to 6 per category, with reasons).
- edx_courses <-> appendix: exact normalised title match. 20 of 200 distinct appendix titles match; those courses gain historical completion figures. The rest have no URLs and are never shown as courses.
- Occupation -> SOC major group: first two digits of the SOC code; names are the official SOC 2018 major-group names (external reference).

## Cleaning performed
- CSV parsing is strict (quotes, embedded newlines, BOM); malformed files fail with a clear message.
- 0 duplicate occupation-category-product rows merged (Hot/In Demand flags OR-ed).
- 1 duplicate edX row removed (by URL), leaving 974 courses. Price strings parsed into free-to-audit and certificate price; 0 unparsed.
- Appendix rows aggregated per title across offerings (participants and certified summed).
- Ambiguous product names (Analyze, REDUCE, Google, Programming languages, Bootstrap, Processing) excluded from product matching.

## Known data-quality issues
- **197 course URLs (20%) are cut at 77 characters** in the source and may be dead. Flagged `urlSuspect`; shown with a warning. Links were not verified (no network access during development).
- The edX data is a 2020 snapshot: prices, availability and URLs may have changed.
- 134 skill categories: 72 have crosswalk entries, 63 have at least one course, 40 have four or more. Others show "no suitable course".
- Many matched courses are in Spanish and other languages; the UI defaults to English.
- No job-market dataset was supplied. The only market-like fields are the Hot Technology and In Demand flags on technologies. No salaries, openings, or trends are shown.
- No per-occupation interest or aptitude data was supplied, so group-level editorial profiles (config) are used.
