# Novigo: complete source code

Generated file listing. Generated data (public/data), raw CSVs and zips are omitted; regenerate data with npm run build:data.


---

## README.md

````markdown
# Novigo - career discovery platform

Assessment -> explained career matches -> technologies (skills) per career -> courses per skill, built from O*NET and edX data. Plain HTML/CSS/JavaScript, no runtime dependencies. A Netlify Function powers the optional AI chatbot.

## Structure
```
public/                 deployable site (publish directory)
  index.html            app shell (hash routes: #/assess, #/results, #/careers, #/skills, #/courses, #/profile, #/about)
  js/app.js             UI, routing, assessment flow, results, courses, profile, chat widget
  js/assessment/        questions.js (item bank, keys, rubrics), scoring.js (branching, validation, scoring)
  js/engine.js          recommendation engine     js/chat/retrieval.js  dataset-grounded answers
  config/recommender.config.json   weights, limits, SOC group profiles (editable)
  data/                 GENERATED json (npm run build:data)
netlify/functions/chat.mjs   chatbot endpoint (AI optional)
scripts/build-data.mjs  CSV -> JSON pipeline        scripts/build-standalone.mjs  one-file build
config/skill-course-crosswalk.json   skill category -> course keywords (editable)
data/raw/               your four original CSVs (untouched)
tests/  docs/
```

## Run locally
```
npm run build:data          # regenerate public/data from data/raw (Node 20+)
npm test                    # 32 tests
python3 -m http.server -d public 8080   # or: npx netlify dev   (also serves the chat function)
```
Open http://localhost:8080. Without the function the chatbot falls back to local dataset answers automatically.

## Deploy to Netlify (https://novigo-career.netlify.app)
1. Put this folder in a Git repo and connect it to the Netlify site (or use `netlify deploy --prod` from the CLI). Drag-and-drop uploads of just `public/` will work for the site but **do not deploy the chat function**.
2. `netlify.toml` already sets publish = `public`, functions = `netlify/functions`, and the build command `npm run build:data`.
3. Optional AI chatbot: in Site settings -> Environment variables add `ANTHROPIC_API_KEY` (and optionally `CHAT_MODEL`). The key stays server-side. Without it the function returns dataset answers (`mode: retrieval`).
4. The old homepage popup and Academies/quiz pages are replaced by the new app shell. Nav: Home, About, Assessment, Careers, Skills, Courses, Profile.

`dist/novigo-standalone.html` (from `node scripts/build-standalone.mjs`) is a single file with everything inlined, useful for previews and static hosts. It has no AI chatbot.

## Updating the datasets
Replace files in `data/raw/` keeping the same column names, run `npm run build:data`, run `npm test`, redeploy. Missing files or columns stop the build with a specific error. To improve course matching edit `config/skill-course-crosswalk.json`.

## Tuning the recommender
Edit `public/config/recommender.config.json`: `weights` (aptitude, interest, ei, workStyle, tools), `bonus` points (explore, subject, stream), `topN`, `maxPerGroup`, `minTechRecords`, and each SOC group profile. Group profiles are editorial heuristics, not derived from data. See docs/SCORING.md and the About page.

## Privacy
Answers, results and saved items live in the browser (`localStorage`) and can be deleted from Profile. The chatbot receives results only if the user ticks the sharing box. Limits: 8 messages of context, 500 characters per message, 10 requests per minute per function instance (best-effort).

## Known limitations
See docs/DATA_DICTIONARY.md and docs/TEST_REPORT.md. In short: no real job-market data, partial course coverage, possibly truncated course URLs, exploratory (non-validated) assessment, UI not browser-tested during development.
````

---

## config/skill-course-crosswalk.json

````json
{
  "_readme": "Editorial mapping, NOT derived from the datasets. Each key is an exact 'Element Name' from software_skills.csv. 'kw' = phrases searched in edX course title/summary/description; 'subj' = edX subjects that add a small boost. A course needs a text match to qualify; subject alone never qualifies. Categories not listed return no courses by design.",
  "Spreadsheet software": { "kw": ["excel", "spreadsheet"], "subj": ["Data Analysis & Statistics", "Business & Management"] },
  "Presentation software": { "kw": ["powerpoint", "presentation skills"], "subj": ["Communication"] },
  "Word processing software": { "kw": ["microsoft word", "word processing"] },
  "Office suite software": { "kw": ["microsoft office", "excel"] },
  "Data base user interface and query software": { "kw": ["sql", "database", "query"], "subj": ["Computer Science", "Data Analysis & Statistics"] },
  "Data base management system software": { "kw": ["database", "sql", "mysql", "postgresql", "mongodb"], "subj": ["Computer Science"] },
  "Data base reporting software": { "kw": ["sql", "data visualization", "tableau"], "subj": ["Data Analysis & Statistics"] },
  "Object or component oriented development software": { "kw": ["python", "java", "javascript", "object-oriented", "programming"], "subj": ["Computer Science"] },
  "Development environment software": { "kw": ["python", "java", "javascript", "software development", "programming", "coding"], "subj": ["Computer Science"] },
  "Web platform development software": { "kw": ["web development", "html", "css", "javascript", "react", "node.js", "web application"], "subj": ["Computer Science"] },
  "Web page creation and editing software": { "kw": ["html", "css", "web design", "web development"], "subj": ["Computer Science", "Design"] },
  "Operating system software": { "kw": ["linux", "unix", "operating system"], "subj": ["Computer Science"] },
  "Analytical or scientific software": { "kw": ["data analysis", "statistics", "matlab", "r programming", "python", "machine learning", "data science"], "subj": ["Data Analysis & Statistics", "Science", "Math"] },
  "Business intelligence and data analysis software": { "kw": ["business intelligence", "data analysis", "analytics", "tableau", "power bi", "data visualization"], "subj": ["Data Analysis & Statistics", "Business & Management"] },
  "Data mining software": { "kw": ["data mining", "machine learning", "data science"], "subj": ["Data Analysis & Statistics", "Computer Science"] },
  "Categorization or classification software": { "kw": ["machine learning", "classification"], "subj": ["Computer Science"] },
  "Clustering software": { "kw": ["clustering", "machine learning"], "subj": ["Data Analysis & Statistics"] },
  "Expert system software": { "kw": ["artificial intelligence", "machine learning"], "subj": ["Computer Science"] },
  "Financial analysis software": { "kw": ["financial analysis", "corporate finance", "valuation", "financial modeling", "finance"], "subj": ["Economics & Finance", "Business & Management"] },
  "Accounting software": { "kw": ["accounting", "bookkeeping"], "subj": ["Economics & Finance", "Business & Management"] },
  "Tax preparation software": { "kw": ["tax"], "subj": ["Economics & Finance"] },
  "Enterprise resource planning ERP software": { "kw": ["erp", "enterprise resource", "sap", "supply chain"], "subj": ["Business & Management"] },
  "Materials requirements planning logistics and supply chain software": { "kw": ["supply chain", "logistics", "operations management"], "subj": ["Business & Management"] },
  "Project management software": { "kw": ["project management", "agile", "scrum"], "subj": ["Business & Management"] },
  "Customer relationship management CRM software": { "kw": ["customer relationship", "crm", "customer experience"], "subj": ["Business & Management"] },
  "Sales and marketing software": { "kw": ["digital marketing", "marketing analytics", "marketing", "social media", "seo"], "subj": ["Business & Management", "Communication"] },
  "Human resources software": { "kw": ["human resources", "people analytics", "talent management"], "subj": ["Business & Management"] },
  "Risk management data and analysis software": { "kw": ["risk management", "risk analysis"], "subj": ["Economics & Finance", "Business & Management"] },
  "Process mapping and design software": { "kw": ["business process", "lean", "six sigma", "process improvement"], "subj": ["Business & Management", "Engineering"] },
  "Graphics or photo imaging software": { "kw": ["photoshop", "graphic design", "photography", "image processing"], "subj": ["Design", "Art & Culture"] },
  "Video creation and editing software": { "kw": ["video production", "video editing", "filmmaking"], "subj": ["Art & Culture", "Communication"] },
  "Music or sound editing software": { "kw": ["music production", "audio", "sound design"], "subj": ["Music"] },
  "Desktop publishing software": { "kw": ["publishing", "typography"], "subj": ["Design", "Communication"] },
  "Charting software": { "kw": ["data visualization", "visualization"], "subj": ["Data Analysis & Statistics"] },
  "Computer aided design CAD software": { "kw": ["cad", "computer-aided design", "autocad", "solidworks", "3d modeling"], "subj": ["Engineering", "Architecture"] },
  "Computer aided design CAD and computer aided manufacturing CAM system": { "kw": ["cad", "computer-aided design", "manufacturing"], "subj": ["Engineering"] },
  "Computer aided manufacturing CAM software": { "kw": ["manufacturing", "cnc", "additive manufacturing"], "subj": ["Engineering"] },
  "Geographic information system": { "kw": ["gis", "geospatial", "geographic information", "remote sensing"], "subj": ["Environmental Studies", "Energy & Earth Sciences"] },
  "Map creation software": { "kw": ["mapping", "cartography", "gis"], "subj": ["Environmental Studies"] },
  "Computer imaging software": { "kw": ["image processing", "medical imaging", "computer vision"], "subj": ["Computer Science", "Engineering"] },
  "Cloud-based protection or security software": { "kw": ["cybersecurity", "cyber security", "network security", "cryptography"], "subj": ["Computer Science"] },
  "Network security and virtual private network VPN equipment software": { "kw": ["network security", "cybersecurity", "cryptography"], "subj": ["Computer Science"] },
  "Network security or virtual private network VPN management software": { "kw": ["network security", "cybersecurity", "cryptography"], "subj": ["Computer Science"] },
  "Transaction security and virus protection software": { "kw": ["cybersecurity", "cyber security", "malware", "cryptography"], "subj": ["Computer Science"] },
  "Authentication server software": { "kw": ["authentication", "cybersecurity", "cryptography"], "subj": ["Computer Science"] },
  "Cloud-based data access and sharing software": { "kw": ["cloud computing", "aws", "azure"], "subj": ["Computer Science"] },
  "Cloud-based management software": { "kw": ["cloud computing", "aws", "azure"], "subj": ["Computer Science"] },
  "Software defined networking/ virtualization software": { "kw": ["virtualization", "cloud computing", "networking"], "subj": ["Computer Science"] },
  "Network monitoring software": { "kw": ["computer networks", "networking"], "subj": ["Computer Science"] },
  "LAN software": { "kw": ["computer networks", "networking"], "subj": ["Computer Science"] },
  "Switch or router software": { "kw": ["computer networks", "networking", "tcp/ip"], "subj": ["Computer Science"] },
  "Wireless software": { "kw": ["wireless", "computer networks"], "subj": ["Electronics", "Computer Science"] },
  "Program testing software": { "kw": ["software testing", "test automation", "quality assurance", "debugging"], "subj": ["Computer Science"] },
  "Requirements analysis and system architecture software": { "kw": ["software architecture", "systems engineering", "requirements", "uml", "system design"], "subj": ["Computer Science", "Engineering"] },
  "Configuration management software": { "kw": ["git", "version control", "devops"], "subj": ["Computer Science"] },
  "File versioning software": { "kw": ["git", "github", "version control"], "subj": ["Computer Science"] },
  "Graphical user interface development software": { "kw": ["user interface", "ux", "ui design", "human-computer interaction", "front-end"], "subj": ["Design", "Computer Science"] },
  "Mobile operator specific application software": { "kw": ["android", "ios", "mobile app"], "subj": ["Computer Science"] },
  "Mobile location based services software": { "kw": ["mobile app", "android", "geospatial"], "subj": ["Computer Science"] },
  "Compiler and decompiler software": { "kw": ["compiler", "programming languages"], "subj": ["Computer Science"] },
  "Metadata management software": { "kw": ["metadata", "data management", "data governance"], "subj": ["Data Analysis & Statistics"] },
  "Information retrieval or search software": { "kw": ["information retrieval", "text mining"], "subj": ["Computer Science"] },
  "Application server software": { "kw": ["java", "web application", "web services"], "subj": ["Computer Science"] },
  "Computer based training software": { "kw": ["instructional design", "e-learning", "online learning"], "subj": ["Education & Teacher Training"] },
  "Multi-media educational software": { "kw": ["instructional design", "e-learning", "teaching"], "subj": ["Education & Teacher Training"] },
  "Foreign language software": { "kw": ["english", "spanish", "french", "chinese", "german"], "subj": ["Language"] },
  "Medical software": { "kw": ["health informatics", "clinical", "healthcare"], "subj": ["Medicine", "Health & Safety"] },
  "Industrial control software": { "kw": ["automation", "control systems", "industrial"], "subj": ["Engineering", "Electronics"] },
  "Manufacturing execution system MES software": { "kw": ["manufacturing", "lean", "operations management"], "subj": ["Engineering", "Business & Management"] },
  "Legal management software": { "kw": ["law", "legal"], "subj": ["Law"] },
  "Compliance software": { "kw": ["compliance", "regulation"], "subj": ["Law", "Business & Management"] },
  "Audit software": { "kw": ["audit", "accounting"], "subj": ["Economics & Finance"] }
}
````

---

## docs/DATA_DICTIONARY.md

````markdown
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
````

---

## docs/SCORING.md

````markdown
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
````

---

## docs/TEST_REPORT.md

````markdown
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
````

---

## netlify/functions/chat.mjs

````javascript
// Netlify Function: grounded career chatbot. Uses an AI model only if ANTHROPIC_API_KEY is set; otherwise dataset retrieval.
// The key is read from the environment and never sent to the browser.
import fs from 'node:fs';
import path from 'node:path';
import { answer } from '../../public/js/chat/retrieval.js';

const roots = [process.env.LAMBDA_TASK_ROOT && path.join(process.env.LAMBDA_TASK_ROOT, 'public/data'), path.join(process.cwd(), 'public/data')].filter(Boolean);
const dataDir = roots.find((r) => fs.existsSync(path.join(r, 'occupations-index.json')));
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
let cache;
const data = () => (cache ??= { index: readJson('occupations-index.json'), courses: readJson('courses.json'), loadOcc: async (c) => readJson(`occ/${String(c).replace(/[^0-9.\-]/g, '')}.json`) });

const hits = new Map();
const limited = (ip) => { const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < 60000); a.push(now); hits.set(ip, a); return a.length > 10; }; // best-effort, per warm instance
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (!dataDir) return json(500, { error: 'Data files not found on the server. Run "npm run build:data" and redeploy.' });
  if (limited(context?.ip || req.headers.get('x-nf-client-connection-ip') || 'anon')) return json(429, { error: 'Too many requests' });
  let body; try { body = await req.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  if (!msgs.length || msgs.some((m) => !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 1000) || msgs.at(-1).role !== 'user') return json(400, { error: 'Invalid messages' });
  const ctx = body.context?.recs ? { recs: body.context.recs.slice(0, 5).map((r) => ({ code: String(r.code), title: String(r.title).slice(0, 120), match: Number(r.match) || 0, why: (r.why || []).slice(0, 6).map((w) => String(w).slice(0, 240)) })) } : null;
  const question = msgs.at(-1).content;
  const grounded = await answer(question, ctx, data());
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(200, grounded);
  try {
    const system = `You are Novigo's career guide. Answer using ONLY the FACTS below plus the user's results when provided. Never invent courses, links, salaries, demand, hiring or statistics. Market information is limited to O*NET Hot Technology / In Demand flags on technologies. Cognitive and emotional indicators are exploratory, not diagnostic. If the facts do not cover the question, say so briefly and suggest what you can answer. Be concise.\nFACTS: ${grounded.text}\nUSER RESULTS: ${ctx ? JSON.stringify(ctx.recs) : 'not shared'}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.CHAT_MODEL || 'claude-sonnet-5-5', max_tokens: 500, system, messages: msgs }) });
    if (!r.ok) return json(200, grounded);
    const j = await r.json();
    const text = j.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    return json(200, text ? { text, links: grounded.links, mode: 'ai' } : grounded);
  } catch { return json(200, grounded); }
};
````

---

## netlify.toml

````toml
[build]
  publish = "public"
  command = "npm run build:data"
  functions = "netlify/functions"

[functions]
  included_files = ["public/data/**"]

[[headers]]
  for = "/data/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
````

---

## package.json

````json
{
  "name": "novigo",
  "private": true,
  "type": "module",
  "scripts": {
    "build:data": "node scripts/build-data.mjs",
    "test": "node --test tests/*.test.mjs"
  },
  "engines": { "node": ">=20" }
}
````

---

## public/config/recommender.config.json

````json
{
  "_readme": "Editable. 'groups' are EDITORIAL HEURISTICS (not derived from the datasets) for the 23 standard SOC major groups. Arrays: cog=[logical,numerical,verbal,pattern,creative] importance 0-9; int=[R,I,A,S,E,C] emphasis 0-9; ei=interpersonal intensity 0-9; ws=[collaboration,structure,uncertainty,responsibility] typical level 0-9.",
  "topN": 5, "maxPerGroup": 2, "minTechRecords": 5, "toolSaturation": 0.25,
  "weights": { "aptitude": 0.30, "interest": 0.30, "ei": 0.10, "workStyle": 0.15, "tools": 0.15 },
  "bonus": { "explore": 8, "subject": 4, "stream": 2 },
  "subjectGroups": {
    "Mathematics": ["15","13","17","19"], "Physics": ["17","19","15"], "Chemistry": ["19","29","51"], "Biology": ["19","29","31"],
    "Computer Science": ["15","17"], "Economics": ["13","11","19"], "Accountancy": ["13","43"], "Business Studies": ["11","13","41"],
    "History": ["25","19","23"], "Political Science": ["23","21","11"], "Psychology": ["19","21","29"], "Languages and Literature": ["25","27","23"],
    "Art and Design": ["27","17"], "Sociology": ["21","19"], "Physical Education": ["39","33","29"]
  },
  "streamGroups": { "science": ["15","17","19","29"], "commerce": ["11","13","41","43"], "humanities": ["21","23","25","27"] },
  "groups": {
    "11": { "cog": [6,6,8,5,5], "int": [3,4,3,6,9,6], "ei": 7, "ws": [8,6,6,9] },
    "13": { "cog": [7,8,7,6,4], "int": [2,6,2,4,7,9], "ei": 5, "ws": [6,8,4,6] },
    "15": { "cog": [9,8,5,9,6], "int": [4,9,4,2,4,5], "ei": 3, "ws": [5,6,6,5] },
    "17": { "cog": [8,9,5,8,6], "int": [8,8,4,2,4,6], "ei": 3, "ws": [6,7,5,6] },
    "19": { "cog": [8,8,7,8,6], "int": [5,9,3,4,3,4], "ei": 4, "ws": [6,6,7,4] },
    "21": { "cog": [5,3,7,4,5], "int": [2,4,4,9,4,3], "ei": 9, "ws": [8,5,6,6] },
    "23": { "cog": [9,4,9,6,4], "int": [1,5,3,5,8,7], "ei": 6, "ws": [5,8,5,8] },
    "25": { "cog": [5,4,8,4,6], "int": [2,4,6,9,5,5], "ei": 8, "ws": [8,6,5,6] },
    "27": { "cog": [5,3,7,6,9], "int": [4,4,9,5,6,3], "ei": 5, "ws": [6,3,7,5] },
    "29": { "cog": [7,6,6,6,4], "int": [5,8,2,8,3,6], "ei": 7, "ws": [7,8,5,8] },
    "31": { "cog": [4,3,5,4,3], "int": [6,3,2,9,2,6], "ei": 8, "ws": [7,7,3,4] },
    "33": { "cog": [5,3,5,5,3], "int": [8,3,1,6,6,6], "ei": 6, "ws": [7,8,6,7] },
    "35": { "cog": [3,4,4,3,5], "int": [8,2,4,7,5,5], "ei": 6, "ws": [7,6,5,4] },
    "37": { "cog": [3,3,3,4,2], "int": [9,1,1,3,2,6], "ei": 3, "ws": [4,7,4,4] },
    "39": { "cog": [3,3,5,3,6], "int": [5,2,6,9,4,4], "ei": 8, "ws": [6,5,5,4] },
    "41": { "cog": [5,6,7,4,5], "int": [2,3,3,6,9,5], "ei": 7, "ws": [7,5,8,6] },
    "43": { "cog": [4,5,5,5,3], "int": [2,2,2,5,3,9], "ei": 5, "ws": [6,9,3,4] },
    "45": { "cog": [4,4,3,5,4], "int": [9,5,2,3,4,4], "ei": 3, "ws": [4,5,6,5] },
    "47": { "cog": [4,5,3,6,4], "int": [9,3,2,3,4,5], "ei": 4, "ws": [6,7,5,6] },
    "49": { "cog": [5,5,4,7,4], "int": [9,5,2,3,3,5], "ei": 3, "ws": [4,6,6,5] },
    "51": { "cog": [4,5,3,6,3], "int": [9,3,2,2,3,7], "ei": 3, "ws": [5,8,3,4] },
    "53": { "cog": [4,4,3,5,3], "int": [8,2,1,3,4,6], "ei": 3, "ws": [3,7,5,6] },
    "55": { "cog": [5,5,4,6,4], "int": [8,4,1,5,6,6], "ei": 5, "ws": [7,9,6,8] }
  }
}
````

---

## public/css/animations.css

````css
/* =========================================================
   Novigo — animations.css
   Kept deliberately minimal: one orchestrated entrance on
   the hero, a soft popup entrance, and a subtle reveal for
   cards as they scroll into view (class added by script.js).
   Everything here is skipped automatically for users who
   have prefers-reduced-motion set (see style.css).
   ========================================================= */

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hero: headline, subtitle, and buttons stagger in on page load */
.hero h1 {
  animation: fadeSlideUp 0.6s ease both;
}

.hero-subtitle {
  animation: fadeSlideUp 0.6s ease both;
  animation-delay: 0.12s;
}

.hero-actions {
  animation: fadeSlideUp 0.6s ease both;
  animation-delay: 0.22s;
}

/* Welcome popup entrance */
.popup-content {
  animation: popIn 0.25s ease both;
}

/* AI analysis screen: spinning ring + message swapped by quiz.js */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--line);
  border-top-color: var(--signal);
  border-radius: 50%;
  margin: 0 auto 1.25rem;
  animation: spin 0.8s linear infinite;
}

#analysis-message {
  font-family: var(--font-mono);
  font-size: 0.95rem;
}

/* Scroll reveal: script.js adds .in-view via IntersectionObserver */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}
````

---

## public/css/app.css

````css
/* Novigo app views. Uses tokens from style.css. */
.skip { position: absolute; left: -999px; } .skip:focus { left: 8px; top: 8px; background: var(--surface); padding: .5rem 1rem; z-index: 99; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.app-main { max-width: var(--max-width); margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.app-main h1:focus { outline: none; }
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 3px solid var(--signal); outline-offset: 2px; }
.lead { max-width: 65ch; margin-bottom: 1.25rem; } .small { font-size: .88rem; } .err { color: #B3261E; font-weight: 500; margin-top: .5rem; } .warn { color: #8A5A00; }
[data-theme="dark"] .err { color: #FF8A80; } [data-theme="dark"] .warn { color: var(--amber); }
.card, .career, .course, .skill { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.25rem; margin-bottom: 1rem; }
.card h2 { margin-bottom: .75rem; } .career-top { display: flex; justify-content: space-between; gap: 1rem; } .career ul, .card ul, .card ol { margin: .25rem 0 .75rem 1.2rem; list-style: disc; } .card ol { list-style: decimal; }
.match { font: 600 2rem var(--font-mono); color: var(--signal-dark); white-space: nowrap; } .match small { font-size: .9rem; color: var(--ink-soft); }
[data-theme="dark"] .match { color: var(--signal); }
.bar { height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; } .bar.big { height: 12px; } .bar span { display: block; height: 100%; background: var(--signal); }
.meters { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .75rem 1.5rem; margin-bottom: 1rem; } .meter-row { display: flex; justify-content: space-between; font-size: .92rem; }
.q { border: 1px solid var(--line); border-radius: var(--radius); padding: 1rem; margin: 0 0 1rem; } .q legend { font-weight: 600; padding: 0 .4rem; max-width: 100%; }
.q-missing { border-color: #B3261E; } .opt { display: block; padding: .35rem 0; cursor: pointer; } .opt input { margin-right: .5rem; }
.likert { display: grid; grid-template-columns: repeat(5, 1fr); gap: .4rem; } .likert label { text-align: center; font-size: .8rem; border: 1px solid var(--line); border-radius: 8px; padding: .5rem .2rem; cursor: pointer; }
.likert label:has(input:checked) { background: var(--signal); color: #fff; border-color: var(--signal); } .likert input { display: block; margin: 0 auto .25rem; }
.chips { display: flex; flex-wrap: wrap; gap: .25rem 1rem; } .field { display: block; margin: .75rem 0; font-weight: 500; } .field select, .filters input, .filters select { display: block; margin-top: .25rem; padding: .5rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); font: inherit; min-width: 220px; }
.filters { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; } .nav-row { display: flex; justify-content: space-between; gap: .75rem; margin: 1.25rem 0; flex-wrap: wrap; }
.btn-sm { padding: .4rem .8rem; font-size: .9rem; } .btn[aria-pressed="true"] { background: var(--signal); color: #fff; border-color: var(--signal); }
.list li { padding: .5rem 0; border-bottom: 1px solid var(--line); } .courses { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem; } .course h4 { margin-bottom: .25rem; }
.skill summary { cursor: pointer; } .state { text-align: center; padding: 2rem 1rem; color: var(--ink-soft); } .state.error { color: #B3261E; }
.chat-toggle { position: fixed; right: 1rem; bottom: 1rem; z-index: 40; background: var(--signal-dark); color: #fff; border: 0; border-radius: 99px; padding: .8rem 1.2rem; font-weight: 600; cursor: pointer; }
.chat-panel { position: fixed; right: 1rem; bottom: 4.5rem; z-index: 40; width: min(380px, calc(100vw - 2rem)); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: .75rem; box-shadow: 0 8px 30px rgba(0,0,0,.18); }
.chat-panel[hidden] { display: none; } .chat-log { max-height: 45vh; overflow-y: auto; margin-bottom: .5rem; } .msg { margin: .4rem 0; padding: .5rem .7rem; border-radius: 10px; font-size: .92rem; } .msg.user { background: var(--mist); margin-left: 2rem; } .msg.bot { border: 1px solid var(--line); margin-right: 1rem; } .msg a { display: inline-block; margin: .25rem .5rem 0 0; font-size: .85rem; }
#chat-form { display: flex; gap: .5rem; margin-top: .5rem; } #chat-form input { flex: 1; padding: .5rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); }
@media (max-width: 640px) { .likert { grid-template-columns: 1fr; } .likert label { text-align: left; display: flex; gap: .5rem; align-items: center; } .likert input { margin: 0; } .career-top { flex-direction: column; } }
````

---

## public/css/style.css

````css
/* =========================================================
   Novigo — style.css
   Design tokens are defined once as CSS custom properties
   so every component pulls from the same palette/type scale.
   ========================================================= */

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

:root {
  /* --- Color tokens --- */
  --ink:        #12172B;
  --ink-soft:   #4B5166;
  --mist:       #EEF1EE;
  --surface:    #FFFFFF;
  --line:       #D8DCD6;
  --signal:     #0F9D74;
  --signal-dark:#0B7D5C;
  --amber:      #E8A33D;

  /* --- Type tokens --- */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'IBM Plex Sans', sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;

  /* --- Layout tokens --- */
  --max-width: 1120px;
  --radius: 10px;
  --gap: 1.5rem;
}

/* Dark mode: JS toggles data-theme="dark" on <html> */
[data-theme="dark"] {
  --ink:        #EDEFEA;
  --ink-soft:   #A7ADBE;
  --mist:       #0D1117;
  --surface:    #171C2C;
  --line:       #2A3142;
}

/* =========================================================
   RESET & BASE
   ========================================================= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--mist);
  color: var(--ink);
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.15;
  color: var(--ink);
}

h1 { font-size: clamp(2.2rem, 4vw, 3.4rem); }
h2 { font-size: clamp(1.6rem, 2.6vw, 2.2rem); margin-bottom: 1.5rem; }
h3 { font-size: 1.15rem; margin-bottom: 0.5rem; }

p { color: var(--ink-soft); }

a {
  color: var(--signal);
  text-decoration: none;
}

ul { list-style: none; }

img { max-width: 100%; display: block; }

/* Visible focus ring for keyboard navigation — accessibility floor */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

section {
  padding: 4rem 0;
}

/* =========================================================
   BUTTONS
   ========================================================= */
.btn {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.btn:hover { transform: translateY(-1px); }

.btn-primary {
  background-color: var(--signal);
  color: #ffffff;
}
.btn-primary:hover { background-color: var(--signal-dark); }

.btn-secondary {
  background-color: transparent;
  color: var(--ink);
  border-color: var(--line);
}
.btn-secondary:hover { border-color: var(--ink-soft); }

.btn-outline {
  background-color: transparent;
  color: var(--signal);
  border-color: var(--signal);
}
.btn-outline:hover { background-color: var(--signal); color: #fff; }

.btn-large {
  padding: 0.9rem 1.8rem;
  font-size: 1.05rem;
}

/* =========================================================
   NAVBAR
   ========================================================= */
.navbar {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--ink);
}

.nav-links {
  display: flex;
  gap: 1.75rem;
}

.nav-links a {
  color: var(--ink-soft);
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-links a:hover { color: var(--signal); }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

#theme-toggle {
  background: none;
  border: 1.5px solid var(--line);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  cursor: pointer;
  font-size: 1rem;
}

/* Hamburger button — hidden on desktop, shown only under 640px */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: 1.5px solid var(--line);
  border-radius: 6px;
  width: 38px;
  height: 38px;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--ink);
}

/* =========================================================
   HERO
   ========================================================= */
.hero {
  text-align: center;
  padding: 5rem 0 4rem;
}

.hero .highlight { color: var(--signal); }

.hero-subtitle {
  max-width: 560px;
  margin: 1.25rem auto 0;
  font-size: 1.1rem;
}

.hero-actions {
  margin-top: 2.25rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* =========================================================
   HOW IT WORKS — signature pathway motif
   The dashed line + numbered dots visually plot a route,
   echoing the site's "career journey" concept.
   ========================================================= */
.how-it-works { text-align: center; }

.steps-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap);
  margin-top: 2rem;
}

.steps-grid::before {
  content: "";
  position: absolute;
  top: 28px;
  left: 12%;
  right: 12%;
  border-top: 2px dashed var(--line);
  z-index: 0;
}

.step-card {
  position: relative;
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.75rem 1.25rem 1.5rem;
  text-align: left;
  z-index: 1;
}

.step-card::before {
  content: "";
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--signal);
  margin-bottom: 1rem;
}

.step-card h3 { font-size: 1rem; }
.step-card p { font-size: 0.9rem; }

/* =========================================================
   WHY SECTION
   ========================================================= */
.why-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
}

.why-card {
  padding: 1.5rem;
  border-left: 3px solid var(--signal);
  background-color: var(--surface);
  border-radius: 0 var(--radius) var(--radius) 0;
}

/* =========================================================
   CTA SECTION
   ========================================================= */
.cta-section {
  text-align: center;
  background-color: var(--ink);
  color: #fff;
  border-radius: var(--radius);
  padding: 3.5rem 2rem;
}

.cta-section h2 { color: #fff; }

/* =========================================================
   PAGE HEADER (used on about/jobs/skills/etc.)
   ========================================================= */
.page-header {
  text-align: center;
  padding-bottom: 2rem;
}

.page-header p {
  max-width: 520px;
  margin: 0.75rem auto 0;
}

/* =========================================================
   ABOUT PAGE
   ========================================================= */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 0;
}

.about-block {
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2rem;
}

.checklist li {
  padding-left: 1.5rem;
  position: relative;
  margin-top: 0.5rem;
  color: var(--ink-soft);
}

.checklist li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--signal);
  font-weight: 700;
}

/* =========================================================
   FORMS (profile page)
   ========================================================= */
.card-form {
  max-width: 520px;
  margin: 0 auto;
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-form label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.card-form input,
.card-form select {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.65rem 0.8rem;
  border: 1.5px solid var(--line);
  border-radius: 6px;
  background-color: var(--mist);
  color: var(--ink);
}

.card-form input:focus,
.card-form select:focus {
  border-color: var(--signal);
  outline: none;
}

.card-form button { margin-top: 1.75rem; }

/* =========================================================
   PROGRESS BAR — shared by quiz + skill roadmap + dashboard
   Styled as a "path" being filled in, not a plain bar.
   ========================================================= */
.progress-container {
  width: 100%;
  height: 10px;
  background-color: var(--line);
  border-radius: 999px;
  overflow: hidden;
  margin: 0.75rem 0;
}

.progress-bar {
  height: 100%;
  width: 0%;
  background-color: var(--signal);
  border-radius: 999px;
  transition: width 0.4s ease;
}

#quiz-progress-label {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 2rem;
}

/* =========================================================
   QUIZ
   ========================================================= */
.quiz-section {
  max-width: 560px;
  margin: 0 auto;
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2.5rem;
}

.quiz-section.hidden { display: none; }

fieldset {
  border: none;
  margin-bottom: 1.75rem;
}

legend {
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
}

fieldset label {
  display: block;
  padding: 0.5rem 0;
  color: var(--ink-soft);
  cursor: pointer;
}

.quiz-section .btn { margin-top: 0.5rem; margin-right: 0.5rem; }

/* =========================================================
   DASHBOARD
   ========================================================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
}

.dashboard-card {
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.75rem;
}

.stat-large {
  font-family: var(--font-mono);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--signal);
  margin: 0.25rem 0;
}

.mini-list li {
  color: var(--ink-soft);
  padding: 0.15rem 0;
}

.card-link {
  display: inline-block;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.quick-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 0;
}

/* =========================================================
   JOB / SKILL / ACADEMY CARDS
   ========================================================= */
.search-bar-section { padding-bottom: 1.5rem; }

.search-bar-section input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  font-family: var(--font-body);
  font-size: 1rem;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  background-color: var(--surface);
  color: var(--ink);
}

.jobs-grid,
.academies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap);
  padding-top: 1rem;
}

.job-card,
.academy-card,
.skill-card {
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.75rem;
}

.job-demand,
.academy-rating {
  font-family: var(--font-mono);
  color: var(--signal);
  font-size: 0.9rem;
  font-weight: 600;
}

.job-salary {
  font-family: var(--font-mono);
  color: var(--amber);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.job-skills { font-size: 0.9rem; margin-bottom: 1rem; }

.skills-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding-top: 1rem;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-difficulty {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
}

/* =========================================================
   PORTFOLIO
   ========================================================= */
.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  padding-top: 1rem;
}

.portfolio-block {
  background-color: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.5rem;
  text-align: center;
}

.history-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--line);
  color: var(--ink-soft);
}

/* =========================================================
   FAQ ACCORDION
   ========================================================= */
.faq-list {
  max-width: 640px;
  margin: 0 auto;
  padding-top: 1rem;
}

.faq-item {
  border-bottom: 1px solid var(--line);
}

.faq-question {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink);
  padding: 1.25rem 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question::after {
  content: "+";
  font-size: 1.4rem;
  color: var(--signal);
  transition: transform 0.2s ease;
}

.faq-item.open .faq-question::after {
  transform: rotate(45deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.open .faq-answer {
  max-height: 200px;
}

.faq-answer p {
  padding-bottom: 1.25rem;
}

/* =========================================================
   WELCOME POPUP
   ========================================================= */
.popup {
  position: fixed;
  inset: 0;
  background-color: rgba(18, 23, 43, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.popup.hidden { display: none; }

.popup-content {
  background-color: var(--surface);
  border-radius: var(--radius);
  padding: 2.5rem;
  max-width: 400px;
  text-align: center;
  position: relative;
}

.popup-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--ink-soft);
}

.popup-content p { margin: 0.75rem 0 1.5rem; }

/* =========================================================
   FOOTER
   ========================================================= */
footer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid var(--line);
  font-size: 0.85rem;
}

.footer-links {
  display: flex;
  gap: 1.25rem;
}

.data-loading {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--ink-soft);
  text-align: center;
  padding: 2rem 0;
  grid-column: 1 / -1;
}

/* =========================================================
   RESPONSIVE — mobile first breakpoints
   ========================================================= */
@media (max-width: 900px) {
  .steps-grid,
  .why-grid,
  .dashboard-grid,
  .jobs-grid,
  .academies-grid,
  .portfolio-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps-grid::before { display: none; }
}

@media (max-width: 640px) {
  .mobile-menu-toggle { display: block; }

  /* Nav links become a dropdown panel, toggled by JS adding .open */
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--surface);
    border-bottom: 1px solid var(--line);
    padding: 0.5rem 1.5rem;
    display: none;
  }

  .nav-links.open { display: flex; }

  .nav-links li { width: 100%; }

  .nav-links a {
    display: block;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
  }

  .nav-links li:last-child a { border-bottom: none; }

  .navbar { position: relative; }

  .steps-grid,
  .why-grid,
  .dashboard-grid,
  .jobs-grid,
  .academies-grid,
  .portfolio-summary {
    grid-template-columns: 1fr;
  }

  .navbar {
    flex-wrap: wrap;
  }
}

/* Respect users who've asked for reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
````

---

## public/index.html

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novigo | Career discovery</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/app.css">
</head>
<body>
  <a class="skip" href="#view">Skip to content</a>
  <header>
    <nav class="navbar" aria-label="Main">
      <a class="logo" href="#/">Novigo</a>
      <ul class="nav-links">
        <li><a href="#/">Home</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/assess">Assessment</a></li>
        <li><a href="#/careers">Careers</a></li>
        <li><a href="#/skills">Skills</a></li>
        <li><a href="#/courses">Courses</a></li>
      </ul>
      <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
      <div class="nav-actions">
        <button id="theme-toggle" aria-label="Toggle dark mode">🌙</button>
        <a class="btn btn-secondary" href="#/profile">Profile</a>
        <a class="btn btn-primary" href="#/assess">Start assessment</a>
      </div>
    </nav>
  </header>
  <main id="view" class="app-main"><p class="state">Loading…</p></main>
  <footer><p>© 2026 Novigo. A career-exploration prototype. Scores are exploratory, not diagnostic.</p></footer>

  <button id="chat-toggle" class="chat-toggle" aria-label="Open career assistant">Ask Novigo</button>
  <section id="chat-panel" class="chat-panel" aria-label="Career assistant" hidden>
    <div id="chat-log" class="chat-log" aria-live="polite"></div>
    <p id="chat-mode" class="small">Dataset answers</p>
    <label class="small"><input type="checkbox" id="chat-share"> Let the assistant use my assessment results</label>
    <form id="chat-form"><label class="sr" for="chat-input">Your question</label><input id="chat-input" maxlength="500" autocomplete="off" placeholder="Ask about a career, skill or course"><button class="btn btn-primary btn-sm" type="submit">Send</button></form>
  </section>

  <script src="js/script.js"></script>
  <script type="module" src="js/app.js"></script>
</body>
</html>
````

---

## public/js/app.js

````javascript
// Novigo UI. View functions return HTML strings (testable in Node); boot() wires the DOM in the browser only.
import { PAGES } from './assessment/questions.js';
import { itemsFor, validate, scoreAssessment } from './assessment/scoring.js';
import { recommend } from './engine.js';
import { answer } from './chat/retrieval.js';

const INLINE = typeof window !== 'undefined' ? window.NOVIGO_INLINE : undefined;
const jsonCache = {};
export async function loadJSON(p) {
  if (jsonCache[p]) return jsonCache[p];
  if (INLINE && INLINE[p]) return (jsonCache[p] = INLINE[p]);
  const r = await fetch(p);
  if (!r.ok) throw new Error(`Could not load ${p} (HTTP ${r.status}). If you changed the CSVs, run "npm run build:data".`);
  return (jsonCache[p] = await r.json());
}
const loadData = async () => {
  const [index, courses, skillCourses, cfg] = await Promise.all(['data/occupations-index.json', 'data/courses.json', 'data/skill-courses.json', 'config/recommender.config.json'].map(loadJSON));
  return { index, courses, skillCourses, cfg, loadOcc: (c) => loadJSON(`data/occ/${c}.json`) };
};

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('novigo:' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('novigo:' + k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem('novigo:' + k); } catch { /* storage unavailable */ } }
};
export const S = {
  session: store.get('session', { profile: {}, answers: {}, step: 0 }),
  saved: store.get('saved', { careers: [], courses: [], goals: [] }),
  flag: false, cf: { q: '', level: '', price: '', lang: 'English', subject: '', limit: 30 }
};
const persist = () => { store.set('session', S.session); store.set('saved', S.saved); };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bar = (label, v) => `<div class="meter"><div class="meter-row"><span>${esc(label)}</span><strong>${v == null ? '—' : v}</strong></div><div class="bar" role="img" aria-label="${esc(label)} ${v ?? 'not enough data'}"><span style="width:${v ?? 0}%"></span></div></div>`;

const STAGES = ['School (Class 9–10)', 'School (Class 11–12)', 'Undergraduate', 'Postgraduate', 'Working professional', 'Changing careers'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Accountancy', 'Business Studies', 'History', 'Political Science', 'Psychology', 'Languages and Literature', 'Art and Design', 'Sociology', 'Physical Education'];
const STREAM_OPTS = [['science', 'Science'], ['commerce', 'Commerce'], ['humanities', 'Humanities / Arts'], ['undecided', 'Undecided or changing streams'], ['other', 'Not applicable']];

/* ---------------- assessment ---------------- */
const steps = () => PAGES.map((p) => ({ ...p, items: itemsFor(S.session.profile).filter((i) => i.page === p.id) })).filter((p) => p.items.length);
const LIKERT = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
function itemHtml(it, a, flag) {
  let body;
  if (it.type === 'likert') body = `<div class="likert">${LIKERT.map((l, i) => `<label><input type="radio" name="q:${it.id}" value="${i + 1}" ${a === i + 1 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
  else if (it.type === 'multi') body = it.options.map((o) => `<label class="opt"><input type="checkbox" name="m:${it.id}" value="${esc(o.id)}" ${(a || []).includes(o.id) ? 'checked' : ''}> ${esc(o.label)}</label>`).join('');
  else body = it.options.map((o, i) => `<label class="opt"><input type="radio" name="q:${it.id}" value="${i}" ${a === i ? 'checked' : ''}> ${esc(o)}</label>`).join('');
  return `<fieldset class="q ${flag && it.type !== 'multi' && a === undefined ? 'q-missing' : ''}"><legend>${esc(it.text)}</legend>${body}${flag && a === undefined && it.type !== 'multi' ? '<p class="err">Please choose an answer.</p>' : ''}</fieldset>`;
}
export function viewAssess() {
  const st = steps(), s = S.session, total = st.length + 2, cur = Math.min(s.step, total - 1), p = s.profile;
  const head = `<h1>Career assessment</h1><p class="lead">Exploratory, not diagnostic. About ${itemsFor(p).filter((i) => i.type !== 'multi').length + 2} short questions; your answers stay in your browser.</p><div class="bar big" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${cur + 1}"><span style="width:${((cur + 1) / total) * 100}%"></span></div><p class="small">Step ${cur + 1} of ${total}</p>`;
  let body;
  if (cur === 0) {
    body = `<section class="card"><h2>About you</h2><p>Only what is needed to personalise the questions. Your stream never limits which careers you can see.</p>
      <label class="field">Current stage <select data-p="stage"><option value="">Choose…</option>${STAGES.map((x) => `<option ${p.stage === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <fieldset class="q"><legend>Academic stream</legend>${STREAM_OPTS.map(([v, l]) => `<label class="opt"><input type="radio" name="p:stream" value="${v}" ${p.stream === v ? 'checked' : ''}> ${l}</label>`).join('')}</fieldset>
      <fieldset class="q"><legend>Subjects you like (optional)</legend><div class="chips">${SUBJECTS.map((x) => `<label class="opt"><input type="checkbox" name="p:subjects" value="${x}" ${(p.subjects || []).includes(x) ? 'checked' : ''}> ${x}</label>`).join('')}</div></fieldset>
      <label class="field">What are you hoping to do? <select data-p="goal"><option value="">Choose…</option>${['Explore options', 'Choose a degree or course', 'Switch careers', 'Build new skills'].map((x) => `<option ${p.goal === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="field">Preferred working environment (optional) <select data-p="env"><option value="">No preference</option>${['Office', 'Outdoors', 'Lab or workshop', 'Remote', 'A mix'].map((x) => `<option ${p.env === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      ${S.flag && (!p.stage || !p.stream) ? '<p class="err" role="alert">Please choose your stage and stream option.</p>' : ''}</section>`;
  } else if (cur <= st.length) {
    const pg = st[cur - 1];
    body = `<section class="card"><h2>${esc(pg.title)}</h2>${pg.items.map((it) => itemHtml(it, s.answers[it.id], S.flag)).join('')}${S.flag && !validate(pg.items, s.answers).ok ? '<p class="err" role="alert">Some questions need an answer.</p>' : ''}</section>`;
  } else {
    const v = validate(itemsFor(p), s.answers), all = itemsFor(p);
    body = `<section class="card"><h2>Review and submit</h2><p>${all.filter((i) => i.type !== 'multi').length - v.missing.length} of ${all.filter((i) => i.type !== 'multi').length} questions answered.</p>
      ${v.ok ? '<p>Everything is answered. You can go back to change any answer.</p>' : `<p class="err" role="alert">Unanswered: ${v.missing.length}.</p>${st.map((pg, i) => { const m = validate(pg.items, s.answers).missing.length; return m ? `<button class="btn btn-outline" data-act="goto" data-arg="${i + 1}">${esc(pg.title)}: ${m} left</button>` : ''; }).join(' ')}`}</section>`;
  }
  const nav = `<div class="nav-row">${cur > 0 ? '<button class="btn btn-outline" data-act="prev">Previous</button>' : '<span></span>'}${cur < total - 1 ? '<button class="btn btn-primary" data-act="next">Next</button>' : '<button class="btn btn-primary" data-act="submit">See my results</button>'}</div>`;
  return head + body + nav;
}
function stepValid(cur) {
  const st = steps(), p = S.session.profile;
  if (cur === 0) return !!(p.stage && p.stream);
  if (cur <= st.length) return validate(st[cur - 1].items, S.session.answers).ok;
  return true;
}

/* ---------------- cards ---------------- */
export function courseCard(c, reasons = []) {
  const saved = S.saved.courses.includes(c.id);
  const basis = reasons.length ? `<p class="small">Matched on: ${reasons.map((r) => `${esc(r.type)} “${esc(r.term)}”`).join(', ')}. Text matches are verified; “inferred” items are our mapping.</p>` : '';
  return `<article class="course"><h4><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a></h4>
    <p class="small">${esc(c.provider)} on ${esc(c.platform)} · ${esc(c.level)} · ${esc(c.language || 'language n/a')} · ${esc(c.effort || 'effort n/a')} · ${esc(c.length || 'length n/a')}</p>
    <p class="small">${c.price.freeToAudit ? 'Free to audit' : esc(c.price.raw)}${c.price.certificatePriceUSD ? `; verified certificate listed at $${c.price.certificatePriceUSD}` : ''}</p>
    ${c.summary ? `<p>${esc(c.summary.slice(0, 180))}${c.summary.length > 180 ? '…' : ''}</p>` : ''}${basis}
    ${c.history ? `<p class="small">Historical MITx/HarvardX figures (${c.history.period}): ${c.history.pctCertified}% of ${c.history.participants.toLocaleString()} participants earned certificates.</p>` : ''}
    ${c.urlSuspect ? '<p class="warn small">This link may be cut short in the source data and could fail. Search the title on edX if so.</p>' : ''}
    <button class="btn btn-outline btn-sm" data-act="savecourse" data-arg="${esc(c.id)}" aria-pressed="${saved}">${saved ? 'Saved ✓' : 'Save course'}</button></article>`;
}
const marketLine = (m) => `${m.hot} of ${m.technologies} technologies listed for this occupation are flagged “Hot Technology” and ${m.inDemand} “In Demand” in O*NET. These are technology flags, not current job demand or openings.`;

/* ---------------- views ---------------- */
export async function viewHome() {
  const r = store.get('results', null);
  return `<section class="hero"><h1>Find careers that fit you, then the skills and courses to get there</h1>
    <p class="hero-subtitle">A structured assessment of reasoning, interpersonal judgement, interests and work style, matched to occupations, the technologies they use, and real courses.</p>
    <div class="hero-actions"><a class="btn btn-primary btn-large" href="#/assess">${r ? 'Retake the assessment' : 'Start the assessment'}</a>${r ? '<a class="btn btn-outline btn-large" href="#/results">See my results</a>' : '<a class="btn btn-outline btn-large" href="#/careers">Browse careers</a>'}</div></section>
    <section class="how-it-works"><h2>How it works</h2><div class="steps-grid">
      <article class="step-card"><h3>1. Tell us your background</h3><p>Stage, stream and subjects. Undecided is fine.</p></article>
      <article class="step-card"><h3>2. Answer five short pages</h3><p>Reasoning, stream questions, people scenarios, interests, work style.</p></article>
      <article class="step-card"><h3>3. Get explained matches</h3><p>Up to five careers with a plain-language reason for each.</p></article>
      <article class="step-card"><h3>4. Follow the pathway</h3><p>Career → technologies you would use → courses for each.</p></article></div></section>
    <section class="why-section"><h2>What you receive</h2><div class="why-grid">
      <div class="why-card"><h3>Indicators, not labels</h3><p>Exploratory scores for reasoning, empathy, interests and work style. They are not IQ or EQ tests.</p></div>
      <div class="why-card"><h3>Transparent matching</h3><p>Every match shows why. Weights are published and adjustable.</p></div>
      <div class="why-card"><h3>Honest data</h3><p>Market info is limited to O*NET technology flags. Courses come from a 2020 edX catalogue.</p></div></div></section>`;
}
export const viewAssessWrapper = async () => viewAssess();

export async function viewResults() {
  const r = store.get('results', null);
  if (!r) return '<section class="state"><h1>No results yet</h1><p>Complete the assessment to see matched careers.</p><a class="btn btn-primary" href="#/assess">Start the assessment</a></section>';
  const d = await loadData();
  const sc = r.scores;
  const cards = await Promise.all(r.recs.map(async (rec) => {
    const o = await d.loadOcc(rec.code);
    const cats = [...o.categories].sort((a, b) => b.products.filter((p) => p.hot || p.dem).length - a.products.filter((p) => p.hot || p.dem).length).slice(0, 5);
    return `<article class="career"><div class="career-top"><div><h3>${esc(rec.title)}</h3><p class="small">${esc(rec.groupName)}${rec.aka.length ? ' · also: ' + esc(rec.aka.join(', ')) : ''}</p></div><div class="match" title="Heuristic compatibility indicator">${rec.match}<small>/100</small></div></div>
      <h4>Why it matched</h4><ul>${rec.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      ${rec.strengths.length ? `<p class="small"><strong>Relevant strengths:</strong> ${esc(rec.strengths.join(', '))}</p>` : ''}
      <p class="small"><strong>Technologies it uses:</strong> ${esc(cats.map((c) => c.name).join('; '))}</p>
      <p class="small"><strong>Market information:</strong> ${esc(marketLine(rec.market))}</p>
      <div class="nav-row"><a class="btn btn-primary btn-sm" href="#/career/${rec.code}">Skills and courses</a><button class="btn btn-outline btn-sm" data-act="savecareer" data-arg="${rec.code}" aria-pressed="${S.saved.careers.includes(rec.code)}">${S.saved.careers.includes(rec.code) ? 'Saved ✓' : 'Save career'}</button></div></article>`;
  }));
  return `<h1>Your results</h1><p class="lead">Based on an exploratory assessment. Scores are rough signals, not fixed traits, and match scores are heuristics, not predictions.</p>
    <section class="card"><h2>Your indicators</h2><div class="meters">${['logical', 'numerical', 'verbal', 'pattern'].map((k) => bar(k[0].toUpperCase() + k.slice(1) + ' reasoning', sc.cognitive[k])).join('')}${bar('Creative problem-solving', sc.creative)}${[['awareness', 'Emotional awareness'], ['empathy', 'Empathy'], ['decision', 'Decision-making and conflict resolution']].map(([k, l]) => bar(l, sc.ei[k])).join('')}</div>
    <h3>Interests</h3><div class="meters">${Object.entries({ R: 'Hands-on', I: 'Analytical', A: 'Creative', S: 'Helping', E: 'Leading', C: 'Organising' }).map(([k, l]) => bar(l, sc.interests[k])).join('')}</div></section>
    <h2>Your top careers</h2>${r.recs.length ? cards.join('') : '<p class="state">Not enough answers to produce matches. Please complete more of the assessment.</p>'}
    ${r.recs.length < 5 && r.recs.length ? `<p class="small">Only ${r.recs.length} careers met the data and diversity rules, so fewer than five are shown.</p>` : ''}
    <p class="small">Cap of two careers per occupation group keeps results varied. Details: About page.</p><p><a class="btn btn-outline" href="#/assess">Retake</a></p>`;
}

export async function viewCareers() {
  const d = await loadData();
  const groups = [...new Map(d.index.map((o) => [o.g, o.gn]))].sort((a, b) => a[1].localeCompare(b[1]));
  return `<h1>Careers</h1><p class="lead">${d.index.length} occupations with technology data from O*NET. Search by title or alternate title.</p>
    <div class="filters"><label>Search <input id="career-q" type="search" placeholder="e.g. accountant, data scientist"></label><label>Group <select id="career-g"><option value="">All groups</option>${groups.map(([g, n]) => `<option value="${g}">${esc(n)}</option>`).join('')}</select></label></div><div id="career-list" aria-live="polite"></div>`;
}
export function careerListHtml(index, q, g, limit = 40) {
  const t = q.toLowerCase().trim();
  const m = index.filter((o) => (!g || o.g === g) && (!t || o.t.toLowerCase().includes(t) || o.aka.some((a) => a.toLowerCase().includes(t))));
  if (!m.length) return '<p class="state">No careers match that search.</p>';
  return `<p class="small">${m.length} match${m.length === 1 ? '' : 'es'}</p><ul class="list">${m.slice(0, limit).map((o) => `<li><a href="#/career/${o.c}">${esc(o.t)}</a> <span class="small">${esc(o.gn)} · ${o.n} technologies</span></li>`).join('')}</ul>${m.length > limit ? `<button class="btn btn-outline" data-act="morecareers" data-arg="${limit + 40}">Show more</button>` : ''}`;
}

export async function viewCareer(code) {
  const d = await loadData();
  const idx = d.index.find((o) => o.c === code);
  if (!idx) return '<section class="state"><h1>Career not found</h1><a class="btn btn-primary" href="#/careers">Browse careers</a></section>';
  const o = await d.loadOcc(code), byId = Object.fromEntries(d.courses.map((c) => [c.id, c]));
  const rec = store.get('results', null)?.recs.find((r) => r.code === code);
  const cats = [...o.categories].sort((a, b) => b.products.filter((p) => p.hot || p.dem).length - a.products.filter((p) => p.hot || p.dem).length || b.products.length - a.products.length);
  const item = (c, i) => {
    const sc = d.skillCourses[c.name] || { courses: [] }, flagged = c.products.filter((p) => p.hot || p.dem).length;
    return `<details class="skill" ${i < 2 ? 'open' : ''}><summary><strong>${esc(c.name)}</strong> <span class="small">${c.products.length} tools${flagged ? ` · ${flagged} flagged` : ''} · ${sc.courses.length} course${sc.courses.length === 1 ? '' : 's'}</span></summary>
      <p class="small">Tools listed for this occupation: ${c.products.slice(0, 24).map((p) => `${esc(p.n)}${p.hot ? ' <em>(Hot)</em>' : ''}${p.dem ? ' <em>(In demand)</em>' : ''}`).join(', ')}${c.products.length > 24 ? ` and ${c.products.length - 24} more` : ''}.</p>
      <button class="btn btn-outline btn-sm" data-act="goal" data-arg="${esc(c.name)}" aria-pressed="${S.saved.goals.includes(c.name)}">${S.saved.goals.includes(c.name) ? 'Learning goal ✓' : 'Add as learning goal'}</button>
      ${sc.courses.length ? `<div class="courses">${sc.courses.map((x) => courseCard(byId[x.id], x.reasons)).join('')}</div>` : '<p class="state small">No suitable course for this skill in the supplied datasets.</p>'}</details>`;
  };
  return `<p><a href="#/careers">← All careers</a></p><h1>${esc(o.title)}</h1><p class="small">${esc(o.group)}${o.aka.length ? ' · also known as ' + esc(o.aka.join(', ')) : ''}</p>
    ${rec ? `<section class="card"><h2>Why it matched you (${rec.match}/100, heuristic)</h2><ul>${rec.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></section>` : ''}
    <section class="card"><h2>Market information</h2><p>${esc(marketLine({ technologies: idx.n, hot: idx.hot, inDemand: idx.dem }))}</p></section>
    <h2>Skills (technologies) and courses</h2><p class="small">Skills come from O*NET Technology Skills. The order is our suggestion: categories with more flagged tools first. It is not an official proficiency requirement.</p>
    <div id="skills-wrap">${cats.slice(0, 12).map(item).join('')}${cats.length > 12 ? `<details class="skill"><summary>Show ${cats.length - 12} more categories</summary>${cats.slice(12).map(item).join('')}</details>` : ''}</div>
    <button class="btn btn-outline" data-act="savecareer" data-arg="${code}" aria-pressed="${S.saved.careers.includes(code)}">${S.saved.careers.includes(code) ? 'Saved ✓' : 'Save career'}</button>`;
}

export async function viewSkills() {
  const d = await loadData();
  const count = {};
  for (const o of d.index) for (const c of o.cats) count[c] = (count[c] || 0) + 1;
  const rows = Object.keys(d.skillCourses).sort().map((k) => `<li data-name="${esc(k.toLowerCase())}"><a href="#/skill/${encodeURIComponent(k)}">${esc(k)}</a> <span class="small">${count[k] || 0} occupations · ${d.skillCourses[k].courses.length} courses</span></li>`);
  return `<h1>Skills</h1><p class="lead">${rows.length} technology categories from O*NET. Pick one to see matching courses.</p><label class="filters">Filter <input id="skill-q" type="search" placeholder="e.g. spreadsheet"></label><ul class="list" id="skill-list">${rows.join('')}</ul>`;
}
export async function viewSkill(name) {
  const d = await loadData(), sc = d.skillCourses[name], byId = Object.fromEntries(d.courses.map((c) => [c.id, c]));
  if (!sc) return '<section class="state"><h1>Skill not found</h1><a href="#/skills">All skills</a></section>';
  return `<p><a href="#/skills">← All skills</a></p><h1>${esc(name)}</h1>${sc.mapped ? '' : '<p class="small">No topic mapping exists for this category, so only direct tool-name matches are used.</p>'}${sc.courses.length ? `<div class="courses">${sc.courses.map((x) => courseCard(byId[x.id], x.reasons)).join('')}</div>` : '<p class="state">No suitable course for this skill in the supplied datasets.</p>'}`;
}

export function filterCourses(courses, f) {
  const t = f.q.toLowerCase().trim();
  return courses.filter((c) => (!t || `${c.title} ${c.provider} ${c.summary}`.toLowerCase().includes(t)) && (!f.level || c.level === f.level) && (!f.lang || c.language === f.lang) && (!f.subject || c.subject === f.subject) && (!f.price || (f.price === 'free' ? c.price.freeToAudit : !c.price.freeToAudit)))
    .sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0));
}
export async function viewCourses() {
  const d = await loadData(), opt = (k) => [...new Set(d.courses.map((c) => c[k]).filter(Boolean))].sort();
  const sel = (k, v, label) => `<label>${label} <select data-cf="${k}"><option value="">Any</option>${opt(v).map((x) => `<option ${S.cf[k] === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`;
  return `<h1>Learning resources</h1><p class="lead">${d.courses.length} edX courses (catalogue snapshot from 2020; details and links may have changed).</p>
    <div class="filters"><label>Search <input data-cf="q" type="search" value="${esc(S.cf.q)}"></label>${sel('level', 'level', 'Level')}${sel('lang', 'language', 'Language')}${sel('subject', 'subject', 'Subject')}
    <label>Price <select data-cf="price"><option value="">Any</option><option value="free">Free to audit</option><option value="paid">Paid only</option></select></label></div><div id="clist" aria-live="polite">${courseListHtml(d.courses)}</div>`;
}
export function courseListHtml(courses) {
  const m = filterCourses(courses, S.cf);
  if (!m.length) return '<p class="state">No courses match those filters.</p>';
  return `<p class="small">${m.length} courses${S.cf.lang ? ` in ${esc(S.cf.lang)}` : ''}, most-enrolled first</p><div class="courses">${m.slice(0, S.cf.limit).map((c) => courseCard(c)).join('')}</div>${m.length > S.cf.limit ? '<button class="btn btn-outline" data-act="morecourses">Show more</button>' : ''}`;
}

export async function viewProfile() {
  const d = await loadData(), r = store.get('results', null), byId = Object.fromEntries(d.courses.map((c) => [c.id, c]));
  return `<h1>My profile</h1><p class="lead">Saved on this device only (browser storage). It is not an account and is lost if you clear your browser data.</p>
    <section class="card"><h2>Latest results</h2>${r ? `<p>Taken ${esc(new Date(r.at).toLocaleString())}. Stream: ${esc(r.profile.stream)}.</p><ol>${r.recs.map((x) => `<li><a href="#/career/${x.code}">${esc(x.title)}</a> (${x.match}/100)</li>`).join('')}</ol><a href="#/results">Full results</a>` : '<p>None yet. <a href="#/assess">Take the assessment</a>.</p>'}</section>
    <section class="card"><h2>Saved careers</h2>${S.saved.careers.length ? `<ul>${S.saved.careers.map((c) => { const o = d.index.find((x) => x.c === c); return `<li><a href="#/career/${c}">${esc(o?.t || c)}</a></li>`; }).join('')}</ul>` : '<p>Nothing saved.</p>'}</section>
    <section class="card"><h2>Learning goals</h2>${S.saved.goals.length ? `<ul>${S.saved.goals.map((g) => `<li><a href="#/skill/${encodeURIComponent(g)}">${esc(g)}</a></li>`).join('')}</ul>` : '<p>No goals yet. Add them from a career page.</p>'}</section>
    <section class="card"><h2>Saved courses</h2>${S.saved.courses.length ? `<div class="courses">${S.saved.courses.map((id) => byId[id]).filter(Boolean).map((c) => courseCard(c)).join('')}</div>` : '<p>No saved courses.</p>'}</section>
    <section class="card"><h2>Your data</h2><p>Assessment answers and results are stored only in this browser.</p><button class="btn btn-outline" data-act="clear">Delete all my saved data</button></section>`;
}

export async function viewAbout() {
  return `<h1>About and methodology</h1><section class="card"><h2>What this is</h2><p>Novigo is a career exploration prototype. It is not career counselling, a clinical test, or a prediction of success.</p></section>
  <section class="card"><h2>How matches are made</h2><ol><li>Your answers become indicators (reasoning, empathy and judgement, interests, work style). These are exploratory signals from a short custom test, not validated IQ or EQ measures.</li>
  <li>Each occupation inherits an editorial profile from its standard SOC major group (config file, adjustable). Occupations inside a group therefore share a base fit; tools you want to learn and your chosen fields break ties.</li>
  <li>The score blends aptitude alignment, interest similarity, interpersonal and work-style closeness, and tool overlap with published weights. Small bonuses apply for fields you choose to explore, subjects, and stream. No more than two careers per group appear.</li>
  <li>Market information is separate and never changes your match: only O*NET “Hot Technology” and “In Demand” flags on technologies.</li></ol></section>
  <section class="card"><h2>Data and limits</h2><ul><li>Occupations and technologies: O*NET (job titles and technology skills files you supplied).</li><li>Courses: edX catalogue snapshot (2020) plus MITx/HarvardX statistics (2012–2015) for 20 matching titles. About one in five course links may be cut short in the source.</li><li>Skill-to-course matching uses a published keyword crosswalk; text matches are verified, relevance is inferred.</li><li>No job openings, salaries, or hiring claims are made.</li></ul></section>
  <section class="card"><h2>FAQ</h2><details><summary>Does my stream limit my careers?</summary><p>No. It changes some questions and adds a very small nudge.</p></details><details><summary>Where is my data stored?</summary><p>In your browser only. The chatbot receives your results only if you tick the sharing box.</p></details></section>`;
}

/* ---------------- router and events ---------------- */
const routes = { '': viewHome, assess: viewAssessWrapper, results: viewResults, careers: viewCareers, career: viewCareer, skills: viewSkills, skill: viewSkill, courses: viewCourses, profile: viewProfile, about: viewAbout };
export async function route() {
  const view = document.getElementById('view');
  const [name, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  const fn = routes[name] || routes[''];
  view.innerHTML = '<p class="state" role="status">Loading…</p>';
  try { view.innerHTML = await fn(decodeURIComponent(rest.join('/'))); }
  catch (e) { view.innerHTML = `<div class="state error" role="alert"><p>Something went wrong: ${esc(e.message)}</p><button class="btn btn-outline" data-act="reload">Try again</button></div>`; }
  document.querySelectorAll('.nav-links a').forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === `#/${name}` || (!name && a.getAttribute('href') === '#/') ? 'page' : 'false'));
  if (name === 'career' || name === 'careers') { const q = document.getElementById('career-q'); if (q) renderCareerList(); }
  window.scrollTo(0, 0); view.querySelector('h1')?.setAttribute('tabindex', '-1'); view.querySelector('h1')?.focus({ preventScroll: true });
}
let careerLimit = 40;
async function renderCareerList() { const d = await loadData(); const el = document.getElementById('career-list'); if (el) el.innerHTML = careerListHtml(d.index, document.getElementById('career-q').value, document.getElementById('career-g').value, careerLimit); }
const toggle = (arr, v) => { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); return i < 0; };

async function submitAssessment() {
  const d = await loadData(), p = S.session.profile, all = itemsFor(p);
  if (!p.stage || !p.stream || !validate(all, S.session.answers).ok) { S.flag = true; S.session.step = steps().length + 1; return route(); }
  document.getElementById('view').innerHTML = '<p class="state" role="status">Working out your results…</p>';
  const scores = scoreAssessment(S.session.answers, p), recs = recommend(scores, p, d.index, d.cfg);
  store.set('results', { at: Date.now(), scores, recs, profile: { stream: p.stream, stage: p.stage } });
  S.flag = false; location.hash = '#/results';
}
async function onClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, arg = b.dataset.arg, s = S.session;
  if (['next', 'prev', 'goto', 'submit'].includes(act)) {
    if (act === 'next') { if (!stepValid(s.step)) { S.flag = true; return route(); } S.flag = false; s.step++; }
    else if (act === 'prev') s.step = Math.max(0, s.step - 1);
    else if (act === 'goto') { s.step = Number(arg); S.flag = true; }
    else return submitAssessment();
    persist(); return route();
  }
  if (act === 'savecareer' || act === 'savecourse' || act === 'goal') {
    const key = act === 'savecareer' ? 'careers' : act === 'savecourse' ? 'courses' : 'goals', on = toggle(S.saved[key], arg);
    persist(); b.setAttribute('aria-pressed', on);
    b.textContent = act === 'goal' ? (on ? 'Learning goal ✓' : 'Add as learning goal') : on ? 'Saved ✓' : act === 'savecareer' ? 'Save career' : 'Save course'; return;
  }
  if (act === 'morecourses') { S.cf.limit += 30; return renderCourses(); }
  if (act === 'morecareers') { careerLimit = Number(arg); return renderCareerList(); }
  if (act === 'clear' && confirm('Delete your saved assessment, results and profile data from this browser?')) { ['session', 'results', 'saved'].forEach(store.del); S.session = { profile: {}, answers: {}, step: 0 }; S.saved = { careers: [], courses: [], goals: [] }; return route(); }
  if (act === 'reload') return route();
}
async function renderCourses() { const d = await loadData(); const el = document.getElementById('clist'); if (el) el.innerHTML = courseListHtml(d.courses); }
function onChange(e) {
  const t = e.target, s = S.session;
  if (t.name?.startsWith('q:')) s.answers[t.name.slice(2)] = Number(t.value);
  else if (t.name?.startsWith('m:')) s.answers[t.name.slice(2)] = [...document.querySelectorAll(`[name="${t.name}"]:checked`)].map((x) => x.value);
  else if (t.name === 'p:stream') s.profile.stream = t.value;
  else if (t.name === 'p:subjects') s.profile.subjects = [...document.querySelectorAll('[name="p:subjects"]:checked')].map((x) => x.value);
  else if (t.dataset.p) s.profile[t.dataset.p] = t.value;
  else if (t.dataset.cf) { S.cf[t.dataset.cf] = t.value; S.cf.limit = 30; return renderCourses(); }
  else return;
  persist();
}
function onInput(e) {
  const t = e.target;
  if (t.dataset.cf === 'q') { S.cf.q = t.value; S.cf.limit = 30; renderCourses(); }
  else if (t.id === 'career-q') renderCareerList();
  else if (t.id === 'skill-q') document.querySelectorAll('#skill-list li').forEach((li) => { li.hidden = !li.dataset.name.includes(t.value.toLowerCase().trim()); });
}

/* ---------------- chat widget ---------------- */
const chatLog = [];
async function sendChat(text) {
  const log = document.getElementById('chat-log'), add = (who, t, links = []) => { log.insertAdjacentHTML('beforeend', `<div class="msg ${who}"><p>${esc(t)}</p>${links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(' ')}</div>`); log.scrollTop = log.scrollHeight; };
  add('user', text); chatLog.push({ role: 'user', content: text });
  const res = store.get('results', null), share = document.getElementById('chat-share').checked;
  const ctx = share && res ? { recs: res.recs.map((r) => ({ code: r.code, title: r.title, match: r.match, why: r.why })) } : null;
  const pending = document.createElement('div'); pending.className = 'msg bot'; pending.textContent = 'Thinking…'; log.appendChild(pending);
  let reply = null;
  if (!INLINE) {
    try {
      const r = await fetch('/.netlify/functions/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: chatLog.slice(-8), context: ctx }) });
      if (r.ok) reply = await r.json(); else if (r.status === 429) reply = { text: 'You are sending messages too quickly. Please wait a moment.', links: [] };
    } catch { /* function unreachable: fall back to local retrieval */ }
  }
  if (!reply) { try { reply = await answer(text, ctx, await loadData()); } catch (e) { reply = { text: 'Sorry, I could not load the data: ' + e.message, links: [] }; } }
  pending.remove(); add('bot', reply.text, reply.links || []); chatLog.push({ role: 'assistant', content: reply.text });
  document.getElementById('chat-mode').textContent = reply.mode === 'ai' ? 'AI answers grounded in the datasets' : 'Dataset answers (AI not connected)';
}
function bootChat() {
  const panel = document.getElementById('chat-panel');
  document.getElementById('chat-toggle').addEventListener('click', () => { panel.hidden = !panel.hidden; if (!panel.hidden) document.getElementById('chat-input').focus(); });
  document.getElementById('chat-form').addEventListener('submit', (e) => { e.preventDefault(); const i = document.getElementById('chat-input'), t = i.value.trim().slice(0, 500); if (!t) return; i.value = ''; sendChat(t); });
  document.getElementById('chat-log').insertAdjacentHTML('beforeend', '<div class="msg bot"><p>Hi! Ask about your results, careers, skills or courses.</p></div>');
}

export function boot() {
  document.addEventListener('click', onClick); document.addEventListener('change', onChange); document.addEventListener('input', onInput);
  window.addEventListener('hashchange', route); bootChat(); route();
}
if (typeof document !== 'undefined' && document.getElementById('view')) boot();
````

---

## public/js/assessment/questions.js

````javascript
// Novigo assessment question bank. Pure data, no DOM access.
// Item types: mcq (objective key) | sjt (rubric score 0-3 per option) | likert (1-5) | multi (selection, mapped to engine hints)
// Cognitive and EI results are EXPLORATORY indicators from a short custom test, not validated IQ/EQ measures.
export const VERSION = '0.1';

export const DIMENSIONS = {
  logical: { kind: 'cognitive', label: 'Logical reasoning' }, numerical: { kind: 'cognitive', label: 'Numerical reasoning' },
  verbal: { kind: 'cognitive', label: 'Verbal reasoning' }, pattern: { kind: 'cognitive', label: 'Pattern recognition' },
  creative: { kind: 'creative', label: 'Creative problem-solving' },
  awareness: { kind: 'ei', label: 'Emotional awareness' }, empathy: { kind: 'ei', label: 'Empathy and perspective-taking' },
  decision: { kind: 'ei', label: 'Decision-making and conflict resolution' },
  collaboration: { kind: 'workstyle', label: 'Preference for collaboration' }, structure: { kind: 'workstyle', label: 'Preference for structure' },
  uncertainty: { kind: 'workstyle', label: 'Comfort with uncertainty' }, learning: { kind: 'workstyle', label: 'Appetite for continual learning' },
  responsibility: { kind: 'workstyle', label: 'Comfort with responsibility' },
  R: { kind: 'interest', label: 'Realistic (hands-on, practical)' }, I: { kind: 'interest', label: 'Investigative (analytical, curious)' },
  A: { kind: 'interest', label: 'Artistic (creative, expressive)' }, S: { kind: 'interest', label: 'Social (helping, teaching)' },
  E: { kind: 'interest', label: 'Enterprising (leading, persuading)' }, C: { kind: 'interest', label: 'Conventional (organised, procedural)' }
};

export const PAGES = [
  { id: 'reasoning', title: 'Reasoning' }, { id: 'stream', title: 'Your stream' }, { id: 'people', title: 'People and problem-solving' },
  { id: 'explore', title: 'Interests and exploration' }, { id: 'work', title: 'How you like to work' }
];

const mcq = (id, page, dim, text, options, key, extra = {}) => ({ id, page, dim, type: 'mcq', text, options, key, ...extra });
const sjt = (id, page, dim, text, options, scores) => ({ id, page, dim, type: 'sjt', text, options, scores });
const lk = (id, page, dim, text, reverse = false) => ({ id, page, dim, type: 'likert', text, reverse });

export const ITEMS = [
  // ---- common reasoning (objective) ----
  mcq('L1', 'reasoning', 'logical', 'All nurses are trained in first aid. Meera is trained in first aid. Which conclusion is certain?', ['Meera is a nurse', 'Meera might or might not be a nurse', 'Meera is not a nurse', 'All first-aiders are nurses'], 1),
  mcq('L2', 'reasoning', 'logical', 'If the server is down, the site is offline. The site is online. What follows?', ['The server is down', 'The server is not down', 'Nothing follows', 'The site is slow'], 1),
  mcq('N1', 'reasoning', 'numerical', 'A shop takes 20% off a ₹2,500 bag, then adds 10% tax on the discounted price. What is the final price?', ['₹2,000', '₹2,200', '₹2,250', '₹2,500'], 1),
  mcq('N2', 'reasoning', 'numerical', 'A train covers 180 km in 2.5 hours. At the same speed, how far does it go in 4 hours?', ['252 km', '270 km', '288 km', '300 km'], 2),
  mcq('V1', 'reasoning', 'verbal', 'Passage: "Remote work cut commuting costs, but several teams reported less spontaneous idea-sharing. Managers who added short weekly in-person workshops saw collaboration recover without a return to full office schedules." Which statement is best supported?', ['Remote work should be abolished', 'Occasional in-person sessions helped restore collaboration', 'Commuting costs rose after remote work', 'Idea-sharing improved with remote work'], 1),
  mcq('V2', 'reasoning', 'verbal', 'Choose the word closest in meaning to "meticulous".', ['careless', 'thorough', 'hurried', 'vague'], 1),
  mcq('P1', 'reasoning', 'pattern', 'What comes next? 2, 6, 12, 20, 30, ?', ['40', '42', '44', '36'], 1),
  mcq('P2', 'reasoning', 'pattern', 'Which number does not belong with the others?', ['25', '36', '48', '64'], 2),
  // ---- stream-specific (objective; first item of each stream is also shown to undecided users) ----
  mcq('S1', 'stream', 'logical', 'Plants under red light grew more than plants under green light in 10 of 10 trials, but the red-light plants also received more water. Best conclusion?', ['Red light definitely causes more growth', 'Water is a confounding factor, so the result is unclear', 'Green light stops growth', 'The experiment shows nothing at all'], 1, { stream: 'science', sampler: true }),
  mcq('S2', 'stream', 'numerical', 'A 40 g sample loses 25% of its mass on drying. What mass remains?', ['10 g', '30 g', '32 g', '35 g'], 1, { stream: 'science' }),
  mcq('C1', 'stream', 'numerical', 'Cost price ₹800, selling price ₹1,000. What is the profit percentage on cost?', ['20%', '25%', '30%', '200%'], 1, { stream: 'commerce', sampler: true }),
  mcq('C2', 'stream', 'logical', 'Product A earns ₹50 profit per unit and sells 100 units. Product B earns ₹80 per unit and sells 55 units. Which earns more in total?', ['Product A', 'Product B', 'They are equal', 'Cannot be determined'], 0, { stream: 'commerce' }),
  mcq('H1', 'stream', 'verbal', '"Everyone who criticises the new policy simply wants it to fail." What is the main weakness of this argument?', ['It uses statistics', 'It assumes motives without evidence', 'It is too short', 'It cites an expert'], 1, { stream: 'humanities', sampler: true }),
  mcq('H2', 'stream', 'verbal', 'A historian finds two accounts of the same event that disagree. Best next step?', ['Pick the more dramatic one', 'Check who wrote each, when, and for whom', 'Ignore both', 'Average the two'], 1, { stream: 'humanities' }),
  // ---- emotional and interpersonal judgement (rubric 0-3 per option) ----
  sjt('A1', 'people', 'awareness', 'You get critical feedback and notice your chest tightening and thoughts racing. What do you do first?', ['Reply immediately to defend yourself', 'Pause, name what you are feeling, and respond once calmer', 'Ignore the feedback entirely', 'Vent to a friend about the reviewer'], [0, 3, 0, 1]),
  sjt('A2', 'people', 'awareness', 'After a weak group presentation you feel embarrassed. Which response shows the most self-awareness?', ['Blame the teammates', 'Work out what you could have prepared differently and what felt hard', 'Decide you are simply bad at presenting', 'Pretend it did not matter'], [0, 3, 1, 1]),
  sjt('E1', 'people', 'empathy', 'A usually cheerful teammate has gone quiet this week. What do you do?', ['Leave them completely alone', 'Check in privately and ask if they want to talk or need help', 'Mention it to the whole team', 'Assume they are being lazy'], [1, 3, 0, 0]),
  sjt('E2', 'people', 'empathy', 'A classmate strongly disagrees with you. How do you respond?', ['Try to understand their reasoning before replying', 'Repeat your point louder', 'Stop talking to them', 'Agree to avoid conflict'], [3, 0, 0, 1]),
  sjt('D1', 'people', 'decision', 'Two teammates want opposite approaches to a deadline task and the team is stuck. You:', ['Go with the louder person\u2019s plan', 'Lay out criteria (time, quality, risk) and help the group choose against them', 'Let it drag on', 'Do the work yourself without telling them'], [0, 3, 0, 1]),
  sjt('D2', 'people', 'decision', 'You can pick a safe plan with a moderate payoff or a risky plan with a high payoff and a real chance of failure. How do you decide?', ['Always take the risky one', 'Estimate the downside and whether you could recover from it, then choose', 'Always take the safe one', 'Flip a coin'], [1, 3, 1, 0]),
  // ---- creative problem-solving ----
  sjt('CR1', 'people', 'creative', 'A small caf\u00e9 wants more customers on slow weekday afternoons without cutting prices. Which idea best combines originality and practicality?', ['Run the same ads more often', 'Host a weekly study-group or skill-swap hour that brings in new groups', 'Copy a competitor\u2019s menu', 'Close on weekday afternoons'], [1, 3, 1, 0]),
  lk('CR2', 'people', 'creative', 'I enjoy coming up with several different solutions to one problem.'),
  lk('CR3', 'people', 'creative', 'I often combine ideas from different subjects or fields.'),
  // ---- interests (RIASEC-style; own items, not the validated inventory) ----
  lk('R1', 'explore', 'R', 'I enjoy building, repairing or working with tools and machines.'), lk('R2', 'explore', 'R', 'I like working outdoors or with my hands.'),
  lk('I1', 'explore', 'I', 'I enjoy investigating how things work or solving puzzles.'), lk('I2', 'explore', 'I', 'I like analysing data to find patterns.'),
  lk('A3', 'explore', 'A', 'I enjoy designing, writing, music or other creative expression.'), lk('A4', 'explore', 'A', 'I like work where I can create something original.'),
  lk('S3', 'explore', 'S', 'I enjoy teaching, helping or counselling people.'), lk('S4', 'explore', 'S', 'I like work that improves other people\u2019s wellbeing.'),
  lk('E3', 'explore', 'E', 'I enjoy persuading, leading or starting new ventures.'), lk('E4', 'explore', 'E', 'I like taking charge and convincing others.'),
  lk('C3', 'explore', 'C', 'I enjoy organising information, records or schedules accurately.'), lk('C4', 'explore', 'C', 'I like following clear procedures to get things right.'),
  // ---- cross-stream exploration (selection; feeds the engine, never restricts it) ----
  { id: 'X1', page: 'explore', type: 'multi', target: 'explore', text: 'Which fields would you like to explore, whatever your current stream? (choose any)', options: [
    { id: 'tech', label: 'Technology and computing', soc: ['15'] }, { id: 'biz', label: 'Business and finance', soc: ['11', '13', '41'] },
    { id: 'health', label: 'Healthcare and medicine', soc: ['29', '31'] }, { id: 'arts', label: 'Design, arts and media', soc: ['27'] },
    { id: 'law', label: 'Law and public service', soc: ['23', '33'] }, { id: 'sci', label: 'Science and research', soc: ['19'] },
    { id: 'edu', label: 'Teaching and social work', soc: ['21', '25'] }, { id: 'eng', label: 'Engineering and building', soc: ['17', '47', '49'] } ] },
  { id: 'X2', page: 'explore', type: 'multi', target: 'tools', text: 'Which kinds of tools would you enjoy learning? (choose any)', options: [
    { id: 'prog', label: 'Programming and software development', cats: ['development environment', 'object or component', 'web platform', 'program testing', 'requirements analysis', 'compiler'] },
    { id: 'data', label: 'Data analysis and business intelligence', cats: ['analytical or scientific', 'business intelligence', 'data mining', 'data base', 'spreadsheet', 'charting'] },
    { id: 'design', label: 'Design, graphics and media', cats: ['graphics or photo', 'video creation', 'music or sound', 'desktop publishing', 'computer aided design', 'web page creation', 'graphical user interface'] },
    { id: 'biz', label: 'Business, finance and operations', cats: ['financial analysis', 'accounting', 'enterprise resource', 'project management', 'sales and marketing', 'human resources', 'customer relationship', 'risk management'] },
    { id: 'sci', label: 'Science, engineering and mapping', cats: ['analytical or scientific', 'geographic information', 'computer aided design', 'industrial control', 'map creation', 'computer imaging'] },
    { id: 'care', label: 'Healthcare and education tools', cats: ['medical software', 'computer based training', 'multi-media educational'] },
    { id: 'net', label: 'Networks, cloud and security', cats: ['network', 'cloud', 'security', 'operating system', 'virtual'] } ] },
  // ---- work style (likert; reverse-scored where marked) ----
  lk('K1', 'work', 'collaboration', 'I do my best work when I can discuss ideas with others.'), lk('K2', 'work', 'collaboration', 'I prefer to work on tasks entirely alone.', true),
  lk('W1', 'work', 'structure', 'I like clear instructions and a predictable routine.'), lk('W2', 'work', 'structure', 'I enjoy working out my own way of doing things with few rules.', true),
  lk('U1', 'work', 'uncertainty', 'I am comfortable making decisions with incomplete information.'), lk('U2', 'work', 'uncertainty', 'I get stressed when plans change at short notice.', true),
  lk('LN1', 'work', 'learning', 'I enjoy learning new tools or subjects even without a grade attached.'), lk('LN2', 'work', 'learning', 'Once I master a skill I prefer not to change it.', true),
  lk('RS1', 'work', 'responsibility', 'I am comfortable being accountable for a team\u2019s outcome.'), lk('RS2', 'work', 'responsibility', 'I prefer others to make the final decisions.', true)
];
````

---

## public/js/assessment/scoring.js

````javascript
// Pure scoring logic (browser + Node). Scoring rules are documented in docs/SCORING.md.
import { ITEMS, DIMENSIONS, VERSION } from './questions.js';

export const STREAMS = ['science', 'commerce', 'humanities'];

// Which items a user sees. Common items always; stream items for their branch; undecided/other get one sampler item per stream.
export function itemsFor(profile = {}, items = ITEMS) {
  const stream = profile.stream;
  return items.filter((it) => {
    if (!it.stream) return true;
    if (STREAMS.includes(stream)) return it.stream === stream;
    return !!it.sampler;
  });
}

const isAnswered = (it, a) => {
  if (a === undefined || a === null) return false;
  if (it.type === 'multi') return Array.isArray(a); // an empty selection is a valid answer
  if (it.type === 'likert') return Number.isInteger(a) && a >= 1 && a <= 5;
  return Number.isInteger(a) && a >= 0 && a < it.options.length;
};

// Required-field validation. Multi-select items are optional.
export function validate(items, answers) {
  const missing = items.filter((it) => it.type !== 'multi' && !isAnswered(it, answers[it.id])).map((it) => it.id);
  return { ok: missing.length === 0, missing };
}

// 0-100 per item. Returns null if unanswered.
export function itemScore(it, a) {
  if (!isAnswered(it, a)) return null;
  if (it.type === 'mcq') return a === it.key ? 100 : 0;
  if (it.type === 'sjt') return (it.scores[a] / 3) * 100;
  if (it.type === 'likert') return ((it.reverse ? 6 - a : a) - 1) * 25;
  return null;
}

export function scoreAssessment(answers, profile = {}, items = ITEMS) {
  const shown = itemsFor(profile, items);
  const buckets = {};
  let answered = 0;
  for (const it of shown) {
    if (it.type === 'multi') continue;
    const s = itemScore(it, answers[it.id]);
    if (s === null) continue;
    answered++;
    (buckets[it.dim] ??= []).push(s);
  }
  const dim = (d) => (buckets[d]?.length ? Math.round(buckets[d].reduce((x, y) => x + y, 0) / buckets[d].length) : null);
  const pick = (kind) => Object.fromEntries(Object.entries(DIMENSIONS).filter(([, m]) => m.kind === kind).map(([d]) => [d, dim(d)]));
  const chosen = (target) => {
    const it = shown.find((i) => i.target === target);
    const sel = Array.isArray(answers[it?.id]) ? answers[it.id] : [];
    return it ? it.options.filter((o, i) => sel.includes(o.id ?? i)) : [];
  };
  return {
    version: VERSION,
    cognitive: pick('cognitive'), creative: dim('creative'), ei: pick('ei'),
    interests: pick('interest'), workStyle: pick('workstyle'),
    exploreGroups: [...new Set(chosen('explore').flatMap((o) => o.soc))],
    toolGroups: chosen('tools').map((o) => o.id),
    toolCategoryHints: [...new Set(chosen('tools').flatMap((o) => o.cats))],
    meta: { answered, total: shown.filter((i) => i.type !== 'multi').length, stream: profile.stream ?? 'undecided' }
  };
}
````

---

## public/js/chat/retrieval.js

````javascript
// Dataset-grounded answers shared by the browser fallback and the Netlify function. Never invents data.
const rtNorm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const RT_STOP = new Set('the a an of for to and or in on is are what which how why do i me my can you about with it be get all other'.split(' '));
const RT_GENERIC = new Set('course courses learn learning find skill skills class classes free study recommend tutorial tutorials any some best good online want need show give list'.split(' '));
const rtStem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const rtTokens = (q) => rtNorm(q).split(' ').filter((w) => w && !RT_STOP.has(w)).map(rtStem);

export function rtFindCareers(query, index, n = 2) {
  const qt = new Set(rtTokens(query));
  const hits = [];
  for (const o of index) {
    let best = 0;
    for (const nm of [o.t, ...o.aka].flatMap((n) => [n, ...n.split(/,| and /)])) { const t = rtTokens(nm); if (t.length && t.every((w) => qt.has(w))) best = Math.max(best, t.length); }
    if (best) hits.push({ o, best });
  }
  return hits.sort((a, b) => b.best - a.best || a.o.t.localeCompare(b.o.t)).slice(0, n).map((h) => h.o);
}
export function rtFindCourses(query, courses, n = 5) {
  const t = rtTokens(query).filter((w) => !RT_GENERIC.has(w));
  if (!t.length) return [];
  return courses.map((c) => {
    const ti = rtNorm(c.title), su = rtNorm(c.summary);
    const inT = t.filter((w) => ti.split(' ').includes(w)).length, inS = t.filter((w) => su.split(' ').includes(w)).length;
    return { c, s: inT * 2 + inS };
  }).filter((x) => x.s >= 2 && x.s >= t.length).sort((a, b) => b.s - a.s || (b.c.enrolled || 0) - (a.c.enrolled || 0)).slice(0, n).map((x) => x.c);
}
const rtCourseLine = (c) => `${c.title} (${c.provider}, ${c.level}, ${c.effort || 'effort n/a'}, ${c.price.freeToAudit ? 'free to audit' : c.price.raw})`;
const out = (text, links = []) => ({ text, links, mode: 'retrieval' });

export async function answer(query, ctx, data) {
  const q = rtNorm(query);
  const recs = ctx?.recs;
  const careers = rtFindCareers(query, data.index);
  if (/^(hi|hello|hey)\b/.test(q) && q.split(' ').length < 4) return out('Hello! I can explain your results, list the technologies for a career, find courses, or compare two careers. What would you like?');
  if (/(why|explain).*(recommend|match|result)|my (results|matches)/.test(q)) {
    if (!recs?.length) return out('I do not have your assessment results here. Take the assessment (or tick the box to share your results with me) and I can explain each match.', [{ label: 'Take the assessment', href: '#/assess' }]);
    const r = (careers[0] && recs.find((x) => x.code === careers[0].c)) || recs[0];
    return out(`${r.title} (${r.match}/100, a heuristic indicator): ${r.why.join(' ')}`, [{ label: 'Open career', href: `#/career/${r.code}` }]);
  }
  if (/compare|versus|\bvs\b|difference between/.test(q) && careers.length === 2) {
    const [a, b] = careers;
    const ra = recs?.find((x) => x.code === a.c), rb = recs?.find((x) => x.code === b.c);
    const line = (o, r) => `${o.t}: ${o.gn}; ${o.n} technologies across ${o.cats.length} categories, ${o.hot} flagged Hot Technology, ${o.dem} In Demand${r ? `; your match indicator ${r.match}/100` : ''}.`;
    return out(`${line(a, ra)} ${line(b, rb)} Flags describe technologies, not job demand or suitability.`, [{ label: a.t, href: `#/career/${a.c}` }, { label: b.t, href: `#/career/${b.c}` }]);
  }
  if (careers.length && /skill|tool|technolog|learn|need|require|use/.test(q)) {
    const o = await data.loadOcc(careers[0].c);
    const cats = [...o.categories].sort((x, y) => y.products.filter((p) => p.hot || p.dem).length - x.products.filter((p) => p.hot || p.dem).length).slice(0, 6);
    return out(`Technology categories listed for ${o.title} in the O*NET data (those with the most Hot/In-Demand tools first): ${cats.map((c) => `${c.name} (e.g. ${c.products.slice(0, 2).map((p) => p.n).join(', ')})`).join('; ')}.`, [{ label: `${o.title}: skills and courses`, href: `#/career/${o.code}` }]);
  }
  const hits = rtFindCourses(query, data.courses);
  if (hits.length && /course|learn|study|class|tutorial|python|excel|sql|java|data|finance|marketing|design/.test(q)) return out(`Courses in the supplied edX catalogue (2020 snapshot) that match: ${hits.map(rtCourseLine).join('; ')}. Check each course page for current details.`, [{ label: 'Browse all courses', href: '#/courses' }]);
  if (/\b(stream|science|commerce|humanities|arts)\b/.test(q)) return out('Your stream only adds a small nudge to a few career groups and changes some questions. It never removes careers. Choose fields to explore in the assessment and they get a larger boost.', [{ label: 'Assessment', href: '#/assess' }]);
  if (/where|how do i|navigate|go to|take (the )?(test|assessment|quiz)|start/.test(q)) return out('Use the menu: Assessment to begin, Careers and Skills to browse, Courses for learning resources, Profile for saved items.', [{ label: 'Start assessment', href: '#/assess' }, { label: 'Courses', href: '#/courses' }]);
  if (careers.length) { const o = careers[0]; return out(`${o.t} belongs to the SOC group "${o.gn}". O*NET lists ${o.n} technologies for it${o.aka.length ? `; also known as ${o.aka.join(', ')}` : ''}.`, [{ label: 'Open career', href: `#/career/${o.c}` }]); }
  return out('I can only answer from the supplied career, skill and course data. Try: "what skills does a data scientist need", "courses for python", "compare accountants and economists", or "why was I matched?".');
}
````

---

## public/js/engine.js

````javascript
// Recommendation engine. Transparent, configurable heuristic: group-level editorial profiles (config) vs the user's assessment profile.
// Personal fit is computed separately from market flags; market flags never raise the match score.
import { DIMENSIONS } from './assessment/questions.js';

const ENG_COG = ['logical', 'numerical', 'verbal', 'pattern', 'creative'];
const ENG_INT = ['R', 'I', 'A', 'S', 'E', 'C'];
const ENG_WS = ['collaboration', 'structure', 'uncertainty', 'responsibility'];
const engMean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const engClamp = (v) => Math.max(0, Math.min(100, v));

export function componentScores(scores, g) {
  const cog = { ...scores.cognitive, creative: scores.creative };
  let num = 0, den = 0;
  ENG_COG.forEach((d, i) => { if (cog[d] != null) { num += g.cog[i] * cog[d]; den += g.cog[i]; } });
  const aptitude = den ? num / den : null; // strength alignment: weighted mean of your scores, weighted by what the group emphasises
  const u = ENG_INT.map((k) => scores.interests?.[k]);
  let interest = null; // cosine similarity of interest shapes, rescaled from [0.4,1] to [0,100]
  if (u.every((v) => v != null)) {
    const nu = Math.hypot(...u), ng = Math.hypot(...g.int);
    if (nu && ng) interest = engClamp(((u.reduce((s, v, i) => s + v * g.int[i], 0) / (nu * ng) - 0.4) / 0.6) * 100);
  }
  const eiUser = engMean(Object.values(scores.ei || {}).filter((v) => v != null));
  const ei = eiUser == null ? null : 100 - Math.abs(eiUser - (g.ei * 100) / 9); // closeness to the group's interpersonal intensity
  const wsDiffs = ENG_WS.map((d, i) => (scores.workStyle?.[d] == null ? null : 100 - Math.abs(scores.workStyle[d] - (g.ws[i] * 100) / 9))).filter((v) => v != null);
  return { aptitude, interest, ei, workStyle: engMean(wsDiffs), tools: null };
}

export function recommend(scores, profile, index, cfg) {
  const hints = scores.toolCategoryHints || [];
  const rows = [];
  for (const o of index) {
    const g = cfg.groups[o.g];
    if (!g || o.n < cfg.minTechRecords) continue;
    const c = componentScores(scores, g);
    const frac = hints.length ? o.cats.filter((n) => hints.some((h) => n.toLowerCase().includes(h))).length / o.cats.length : null;
    c.tools = frac == null ? null : 100 * Math.min(1, frac / cfg.toolSaturation);
    let num = 0, den = 0;
    for (const [k, w] of Object.entries(cfg.weights)) if (c[k] != null) { num += w * c[k]; den += w; }
    if (!den) continue;
    const bonuses = [];
    if (scores.exploreGroups?.includes(o.g)) bonuses.push({ type: 'explore', points: cfg.bonus.explore });
    if ((profile?.subjects || []).some((s) => cfg.subjectGroups[s]?.includes(o.g))) bonuses.push({ type: 'subject', points: cfg.bonus.subject });
    if (cfg.streamGroups[profile?.stream]?.includes(o.g)) bonuses.push({ type: 'stream', points: cfg.bonus.stream });
    const total = Math.min(99, Math.round(num / den + bonuses.reduce((s, b) => s + b.points, 0)));
    rows.push({ o, g, c, bonuses, total, frac: frac ?? 0 });
  }
  rows.sort((a, b) => b.total - a.total || b.frac - a.frac || b.o.n - a.o.n || a.o.t.localeCompare(b.o.t));
  const per = {}, picks = [];
  for (const r of rows) {
    if ((per[r.o.g] || 0) >= cfg.maxPerGroup) continue;
    per[r.o.g] = (per[r.o.g] || 0) + 1;
    picks.push(toRec(r, scores, profile));
    if (picks.length >= cfg.topN) break;
  }
  return picks;
}

function toRec({ o, g, c, bonuses, total }, scores, profile) {
  const cog = { ...scores.cognitive, creative: scores.creative };
  const strengths = ENG_COG.map((d, i) => ({ d, s: cog[d], w: g.cog[i] })).filter((x) => x.s != null && x.s >= 50).sort((a, b) => b.w * b.s - a.w * a.s).slice(0, 2);
  const interests = ENG_INT.map((k, i) => ({ k, s: scores.interests?.[k], w: g.int[i] })).filter((x) => x.s != null && x.s >= 50).sort((a, b) => b.w * b.s - a.w * a.s).slice(0, 2);
  const why = [];
  for (const x of strengths) why.push(`Your ${DIMENSIONS[x.d].label.toLowerCase()} indicator (${x.s}/100) lines up with what ${o.gn} careers tend to emphasise.`);
  for (const x of interests) why.push(`You rated ${DIMENSIONS[x.k].label.toLowerCase()} interests highly, a common emphasis in ${o.gn}.`);
  if (c.workStyle != null && c.workStyle >= 70) why.push('Your work-style preferences sit close to the typical profile for this group of occupations.');
  if (c.tools > 0) why.push(`Some of this occupation's technology categories match tools you said you would enjoy learning.`);
  for (const b of bonuses) why.push({ explore: 'You chose this field to explore.', subject: 'It relates to a subject you said you like.', stream: 'It is common among students in your stream (a small nudge only; it never restricts results).' }[b.type]);
  if (!why.length) why.push('This is a broad fit from your overall profile; no single strong signal stood out.');
  const round = (v) => (v == null ? null : Math.round(v));
  return {
    code: o.c, title: o.t, group: o.g, groupName: o.gn, aka: o.aka, match: total,
    components: { aptitude: round(c.aptitude), interest: round(c.interest), ei: round(c.ei), workStyle: round(c.workStyle), tools: round(c.tools) },
    bonuses, why, strengths: strengths.map((x) => DIMENSIONS[x.d].label),
    market: { technologies: o.n, hot: o.hot, inDemand: o.dem, note: 'O*NET technology flags, not current job demand or openings.' }
  };
}
````

---

## public/js/script.js

````javascript
/* =========================================================
   Novigo — script.js
   Shared behaviour that runs on every page. Each block checks
   whether its element actually exists before doing anything —
   that's why one file can safely be linked from all 10 pages
   without throwing errors on pages that don't have, say, a
   FAQ accordion.
   ========================================================= */

/* ---------------------------------------------------------
   1. DARK MODE TOGGLE
   We store the choice in localStorage so it survives page
   navigation and repeat visits — not just this one page load.
   --------------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// On every page load, check if the user previously chose a theme.
const savedTheme = localStorage.getItem('novigo-theme');
if (savedTheme) {
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('novigo-theme', next);
  });
}

/* ---------------------------------------------------------
   2. MOBILE MENU TOGGLE
   Opens/closes the nav-links dropdown on small screens.
   --------------------------------------------------------- */
const menuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });
}

/* ---------------------------------------------------------
   3. WELCOME POPUP (homepage only)
   Uses sessionStorage (not localStorage) on purpose — this
   resets every new browser session instead of being
   permanently dismissed forever after one click.
   --------------------------------------------------------- */
const welcomePopup = document.getElementById('welcome-popup');

if (welcomePopup) {
  const alreadySeen = sessionStorage.getItem('novigo-welcome-seen');

  if (!alreadySeen) {
    welcomePopup.classList.remove('hidden');
  }

  const closePopup = () => {
    welcomePopup.classList.add('hidden');
    sessionStorage.setItem('novigo-welcome-seen', 'true');
  };

  const popupCloseBtn = document.getElementById('popup-close');
  if (popupCloseBtn) {
    popupCloseBtn.addEventListener('click', closePopup);
  }

  // Also close if the user clicks the dark overlay outside the card
  welcomePopup.addEventListener('click', (event) => {
    if (event.target === welcomePopup) {
      closePopup();
    }
  });

  // Also close on Escape key, for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !welcomePopup.classList.contains('hidden')) {
      closePopup();
    }
  });
}

/* ---------------------------------------------------------
   4. FAQ ACCORDION
   Clicking a question toggles its own answer open/closed.
   Only one answer stays open at a time, which keeps a long
   FAQ list from turning into a wall of expanded text.
   --------------------------------------------------------- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close every item first...
    faqItems.forEach((otherItem) => otherItem.classList.remove('open'));

    // ...then reopen this one, unless it was the one already open
    // (that's what makes clicking an open question close it again).
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* ---------------------------------------------------------
   5. SEARCH BAR FILTERING (Future Jobs + Nearby Academies)
   Simple substring match against each card's visible text.
   --------------------------------------------------------- */
function wireUpSearch(inputId, cardSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    // Queried fresh on every keystroke — the jobs page renders its
    // cards from a fetched JSON file, so a snapshot taken at page
    // load would miss cards that hadn't arrived yet.
    const cards = document.querySelectorAll(cardSelector);

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

wireUpSearch('job-search', '.job-card');
wireUpSearch('academy-search', '.academy-card');

/* ---------------------------------------------------------
   6. SCROLL REVEAL
   IntersectionObserver watches every .reveal element and adds
   .in-view the moment it scrolls into the viewport — the
   fade/slide itself is defined in animations.css.
   --------------------------------------------------------- */
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // only needs to happen once per element
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => observer.observe(el));
} else {
  // No IntersectionObserver support (or nothing to reveal) — just show everything
  revealElements.forEach((el) => el.classList.add('in-view'));
}

/* ---------------------------------------------------------
   7. ANIMATED PROGRESS BARS
   Any .progress-bar with a data-target="NN" attribute fills
   from 0% to NN% shortly after the page loads, instead of
   just appearing already full.
   --------------------------------------------------------- */
const animatedBars = document.querySelectorAll('.progress-bar[data-target]');

if (animatedBars.length > 0) {
  window.addEventListener('load', () => {
    animatedBars.forEach((bar) => {
      const target = bar.getAttribute('data-target');
      // Small delay so the fill transition is visible rather than instant
      setTimeout(() => {
        bar.style.width = target + '%';
      }, 200);
    });
  });
}

/* ---------------------------------------------------------
   8. PROFILE FORM
   Saves the profile to localStorage (this is a prototype —
   no real backend) and moves the user on to the quiz, matching
   the planned flow: Profile → Quiz.
   --------------------------------------------------------- */
const profileForm = document.getElementById('profile-form');

if (profileForm) {
  profileForm.addEventListener('submit', (event) => {
    event.preventDefault(); // stop the browser's default page-reload submit

    const formData = new FormData(profileForm);
    const profile = Object.fromEntries(formData.entries());

    localStorage.setItem('novigo-profile', JSON.stringify(profile));

    window.location.href = 'quiz.html';
  });
}
````

---

## scripts/build-data.mjs

````javascript
// Builds public/data/*.json from the raw CSVs in data/raw. Raw files are never modified.
// Run: node scripts/build-data.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCsv, toObjects } from './lib/csv.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

export const SOC_MAJOR = {
  '11': 'Management', '13': 'Business and Financial Operations', '15': 'Computer and Mathematical',
  '17': 'Architecture and Engineering', '19': 'Life, Physical, and Social Science',
  '21': 'Community and Social Service', '23': 'Legal', '25': 'Educational Instruction and Library',
  '27': 'Arts, Design, Entertainment, Sports, and Media', '29': 'Healthcare Practitioners and Technical',
  '31': 'Healthcare Support', '33': 'Protective Service', '35': 'Food Preparation and Serving Related',
  '37': 'Building and Grounds Cleaning and Maintenance', '39': 'Personal Care and Service',
  '41': 'Sales and Related', '43': 'Office and Administrative Support', '45': 'Farming, Fishing, and Forestry',
  '47': 'Construction and Extraction', '49': 'Installation, Maintenance, and Repair', '51': 'Production',
  '53': 'Transportation and Material Moving', '55': 'Military Specific'
};
// Product names that collide with ordinary English words; matching them in course text gives false positives.
const AMBIGUOUS_PRODUCTS = new Set(['analyze', 'reduce', 'google', 'programming languages', 'bootstrap', 'processing']);

export const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reCache = new Map();
export function hasPhrase(text, phrase) {
  let re = reCache.get(phrase);
  if (!re) { re = new RegExp(`(?<![a-z0-9])${esc(phrase.toLowerCase())}(?![a-z0-9])`); reCache.set(phrase, re); }
  return re.test(text);
}

export function parsePrice(raw) {
  const free = /free/i.test(raw);
  const m = raw.match(/\$\s*([\d,]+)/);
  return { raw, freeToAudit: free, certificatePriceUSD: m ? Number(m[1].replace(/,/g, '')) : null, parsed: free || !!m };
}
const readCsv = (file, required) => {
  const p = path.join(ROOT, 'data/raw', file);
  if (!fs.existsSync(p)) throw new Error(`Dataset missing: data/raw/${file}`);
  return toObjects(parseCsv(fs.readFileSync(p, 'utf8')), required);
};
const slug = (s) => norm(s).replace(/ /g, '-').slice(0, 80);

export function buildAll(outDir = path.join(ROOT, 'public/data')) {
  const q = {}; // quality report
  // ---------- skills ----------
  const skillRows = readCsv('software_skills.csv', ['O*NET-SOC Code', 'Title', 'Workplace Example', 'Element Name', 'Hot Technology', 'In Demand']);
  const occ = new Map(); let skillDupes = 0;
  for (const r of skillRows) {
    const code = r['O*NET-SOC Code'];
    if (!occ.has(code)) occ.set(code, { code, title: r.Title, cats: new Map() });
    const cats = occ.get(code).cats;
    if (!cats.has(r['Element Name'])) cats.set(r['Element Name'], new Map());
    const prods = cats.get(r['Element Name']);
    const p = r['Workplace Example'];
    if (prods.has(p)) { skillDupes++; }
    const prev = prods.get(p) ?? { n: p, hot: false, dem: false };
    prev.hot ||= r['Hot Technology'] === 'Y'; prev.dem ||= r['In Demand'] === 'Y';
    prods.set(p, prev);
  }
  q.skills = { rows: skillRows.length, occupations: occ.size, duplicateRowsMerged: skillDupes };
  // ---------- job titles ----------
  const titleRows = readCsv('job_titles.csv', ['O*NET-SOC Code', 'Title', 'Job Title', 'Source(s)']);
  const aka = new Map(); const occTitle = new Map();
  for (const r of titleRows) {
    const c = r['O*NET-SOC Code']; occTitle.set(c, r.Title);
    if (norm(r['Job Title']) === norm(r.Title)) continue;
    if (!aka.has(c)) aka.set(c, new Map());
    const k = norm(r['Job Title']);
    if (!aka.get(c).has(k)) aka.get(c).set(k, { t: r['Job Title'], s: Number(r['Source(s)']) || 0 });
  }
  const skillCodes = new Set(occ.keys());
  q.titles = {
    rows: titleRows.length, occupations: occTitle.size,
    occupationsWithoutTechSkills: [...occTitle.keys()].filter((c) => !skillCodes.has(c)).length,
    skillOccupationsMissingFromTitles: [...skillCodes].filter((c) => !occTitle.has(c)).length
  };
  // ---------- courses ----------
  const edxRows = readCsv('edx_courses.csv', ['title', 'course_url', 'Level', 'subject', 'price']);
  const seen = new Set(); const courses = []; let dupRows = 0, priceFail = 0;
  const idUsed = new Set();
  for (const r of edxRows) {
    const key = r.course_url || norm(r.title);
    if (seen.has(key)) { dupRows++; continue; }
    seen.add(key);
    const price = parsePrice(r.price); if (!price.parsed) priceFail++;
    let id = 'edx-' + (slug(r.course_url.split('/').pop()) || slug(r.title)); let n = 2;
    while (idUsed.has(id)) id = `${id.replace(/-\d+$/, '')}-${n++}`; idUsed.add(id);
    courses.push({
      id, title: r.title, provider: r.institution || 'edX', platform: 'edX', url: r.course_url, level: r.Level, subject: r.subject,
      language: r.language, effort: r.course_effort, length: r.course_length, mode: r.course_type, price,
      enrolled: Number(String(r.n_enrolled).replace(/,/g, '')) || null,
      summary: r.summary, description: r.course_description.slice(0, 600), source: 'edx_courses.csv'
    });
  }
  // The source cuts long URL slugs at a fixed length (modal length is a large spike), so those links may be dead.
  const lenCount = new Map();
  for (const c of courses) lenCount.set(c.url.length, (lenCount.get(c.url.length) || 0) + 1);
  const maxLen = [...lenCount].sort((a, b) => b[1] - a[1])[0][0];
  for (const c of courses) c.urlSuspect = c.url.length === maxLen;
  q.edx = {
    rows: edxRows.length, duplicateRowsRemoved: dupRows, unique: courses.length, priceUnparsed: priceFail,
    truncationLength: maxLen, urlsPossiblyTruncated: courses.filter((c) => c.urlSuspect).length
  };
  // ---------- appendix (MITx/HarvardX statistics) ----------
  const apRows = readCsv('appendix.csv', ['Course Title', 'Participants (Course Content Accessed)', 'Certified']);
  const hist = new Map();
  for (const r of apRows) {
    const k = norm(r['Course Title']); const h = hist.get(k) ?? { participants: 0, certified: 0, offerings: 0, institution: r.Institution };
    h.participants += Number(r['Participants (Course Content Accessed)']) || 0; h.certified += Number(r.Certified) || 0; h.offerings++;
    hist.set(k, h);
  }
  let joined = 0;
  for (const c of courses) {
    const h = hist.get(norm(c.title));
    if (h && h.participants > 0) {
      c.history = { participants: h.participants, certified: h.certified, offerings: h.offerings, pctCertified: Math.round((1000 * h.certified) / h.participants) / 10, period: '2012–2015', source: 'appendix.csv' };
      joined++;
    }
  }
  q.appendix = { rows: apRows.length, distinctTitles: hist.size, matchedToEdx: joined, unmatchedKeptOutOfUI: hist.size - joined, note: 'appendix.csv has no URLs; unmatched titles are statistics only and are never shown as recommendable courses.' };
  // ---------- skill -> course mapping ----------
  const crosswalk = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/skill-course-crosswalk.json'), 'utf8'));
  const productsByCat = new Map();
  for (const o of occ.values()) for (const [cat, prods] of o.cats) {
    if (!productsByCat.has(cat)) productsByCat.set(cat, new Set());
    for (const p of prods.keys()) productsByCat.get(cat).add(p);
  }
  const lc = courses.map((c) => ({ t: c.title.toLowerCase(), s: (c.summary || '').toLowerCase(), d: (c.description || '').toLowerCase() }));
  const skillCourses = {};
  for (const cat of productsByCat.keys()) {
    const cw = crosswalk[cat];
    const prods = [...productsByCat.get(cat)].filter((p) => p.length >= 4 && !AMBIGUOUS_PRODUCTS.has(p.toLowerCase()));
    const scored = [];
    courses.forEach((c, i) => {
      const x = lc[i]; let score = 0; const reasons = [];
      for (const p of prods) {
        if (hasPhrase(x.t, p)) { score += 5; reasons.push({ type: 'product-in-title', term: p }); }
        else if (hasPhrase(x.s, p) || hasPhrase(x.d, p)) { score += 2; reasons.push({ type: 'product-in-text', term: p }); }
      }
      if (cw) for (const k of cw.kw) {
        if (hasPhrase(x.t, k)) { score += 4; reasons.push({ type: 'keyword-in-title', term: k }); }
        else if (hasPhrase(x.s, k)) { score += 2; reasons.push({ type: 'keyword-in-summary', term: k }); }
        else if (hasPhrase(x.d, k)) { score += 1; reasons.push({ type: 'keyword-in-description', term: k }); }
      }
      if (score < 3) return; // text evidence required; subject alone never qualifies
      if (cw?.subj?.includes(c.subject)) { score += 1.5; reasons.push({ type: 'subject-match (inferred)', term: c.subject }); }
      score += Math.log10((c.enrolled || 1) + 1) * 0.1;
      scored.push({ id: c.id, score: Math.round(score * 100) / 100, reasons: reasons.slice(0, 5) });
    });
    scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    skillCourses[cat] = { mapped: !!cw, courses: scored.slice(0, 6), candidates: scored.length };
  }
  q.skillCourses = {
    categories: productsByCat.size, categoriesWithCrosswalk: Object.keys(skillCourses).filter((k) => skillCourses[k].mapped).length,
    categoriesWithAtLeast1Course: Object.values(skillCourses).filter((v) => v.courses.length >= 1).length,
    categoriesWithAtLeast4Courses: Object.values(skillCourses).filter((v) => v.courses.length >= 4).length,
    crosswalkKeysNotInData: Object.keys(crosswalk).filter((k) => !k.startsWith('_') && !productsByCat.has(k))
  };
  // ---------- write ----------
  fs.rmSync(path.join(outDir, 'occ'), { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'occ'), { recursive: true });
  const index = [];
  for (const o of occ.values()) {
    const categories = [...o.cats].map(([name, ps]) => ({ name, products: [...ps.values()].sort((a, b) => a.n.localeCompare(b.n)) }));
    const all = categories.flatMap((c) => c.products);
    const akaList = [...(aka.get(o.code)?.values() ?? [])].sort((a, b) => b.s - a.s || a.t.localeCompare(b.t)).slice(0, 6).map((a) => a.t);
    const g = o.code.slice(0, 2);
    index.push({ c: o.code, t: o.title, g, gn: SOC_MAJOR[g] ?? 'Other', aka: akaList.slice(0, 3), n: all.length, cats: categories.map((c) => c.name), hot: all.filter((p) => p.hot).length, dem: all.filter((p) => p.dem).length });
    fs.writeFileSync(path.join(outDir, 'occ', `${o.code}.json`), JSON.stringify({ code: o.code, title: o.title, group: SOC_MAJOR[g] ?? 'Other', aka: akaList, categories }));
  }
  index.sort((a, b) => a.c.localeCompare(b.c));
  fs.writeFileSync(path.join(outDir, 'occupations-index.json'), JSON.stringify(index));
  fs.writeFileSync(path.join(outDir, 'courses.json'), JSON.stringify(courses));
  fs.writeFileSync(path.join(outDir, 'skill-courses.json'), JSON.stringify(skillCourses));
  fs.writeFileSync(path.join(outDir, 'quality-report.json'), JSON.stringify(q, null, 2));
  return { q, index, courses, skillCourses };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(buildAll().q, null, 2)); }
  catch (e) { console.error('DATA BUILD FAILED:', e.message); process.exit(1); }
}
````

---

## scripts/build-standalone.mjs

````javascript
// Builds dist/novigo-standalone.html: one self-contained file (CSS, JS and data inlined) for previews and static hosting.
// The AI chatbot function is not available in this build; the chatbot uses dataset retrieval.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..'), P = (...a) => path.join(ROOT, 'public', ...a);
const read = (f) => fs.readFileSync(f, 'utf8');
const inline = {};
for (const f of ['data/occupations-index.json', 'data/courses.json', 'data/skill-courses.json', 'config/recommender.config.json']) inline[f] = JSON.parse(read(P(f)));
for (const f of fs.readdirSync(P('data/occ'))) inline[`data/occ/${f}`] = JSON.parse(read(P('data/occ', f)));
const strip = (s) => s.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+(async\s+function|function|const|let)/gm, '$1');
const js = ['assessment/questions.js', 'assessment/scoring.js', 'engine.js', 'chat/retrieval.js', 'app.js'].map((f) => strip(read(P('js', f)))).join('\n');
let html = read(P('index.html'));
const css = ['style.css', 'animations.css', 'app.css'].map((f) => read(P('css', f))).join('\n');
html = html.replace(/<link rel="stylesheet"[^>]*>\s*/g, '').replace('</head>', `<style>${css}</style></head>`);
html = html.replace(/<script[^>]*src=[^>]*><\/script>\s*/g, '');
const safe = (s) => s.replace(/<\/(script)/gi, '<\\/$1');
html = html.replace('</body>', `<script>window.NOVIGO_INLINE=${safe(JSON.stringify(inline))};</script><script>${safe(read(P('js/script.js')))}</script><script>(function(){${safe(js)}\n})();</script></body>`);
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/novigo-standalone.html'), html);
console.log('dist/novigo-standalone.html', (html.length / 1e6).toFixed(1), 'MB');
````

---

## scripts/lib/csv.mjs

````javascript
// Dependency-free RFC 4180 CSV parser. Throws on malformed input instead of guessing.
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = [];
    } else field += c;
  }
  if (inQuotes) throw new Error('Malformed CSV: unterminated quoted field');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function toObjects(rows, requiredColumns = []) {
  if (!rows.length) throw new Error('CSV is empty');
  const head = rows[0].map((h) => h.trim());
  const missing = requiredColumns.filter((c) => !head.includes(c));
  if (missing.length) throw new Error(`CSV is missing required column(s): ${missing.join(', ')}`);
  return rows.slice(1)
    .filter((r) => !(r.length === 1 && r[0] === ''))
    .map((r) => Object.fromEntries(head.map((k, j) => [k, (r[j] ?? '').trim()])));
}
````

---

## tests/app.test.mjs

````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildAll } from '../scripts/build-data.mjs';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'novigo-a-'));
const built = buildAll(out);
const mem = {};
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const rd = (f) => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
globalThis.window = { NOVIGO_INLINE: new Proxy({}, { get: (t, p) => (p === 'config/recommender.config.json' ? JSON.parse(fs.readFileSync('public/config/recommender.config.json', 'utf8')) : typeof p === 'string' && p.startsWith('data/') ? rd(p.slice(5)) : undefined) }) };
const A = await import('../public/js/app.js');
const { itemsFor, scoreAssessment } = await import('../public/js/assessment/scoring.js');
const { recommend } = await import('../public/js/engine.js');
const { answer } = await import('../public/js/chat/retrieval.js');
const data = { index: built.index, courses: built.courses, loadOcc: async (c) => rd(`occ/${c}.json`) };

test('home links to the assessment', async () => assert.match(await A.viewHome(), /#\/assess/));
test('assessment: onboarding, validation message, stream branching, review', () => {
  A.S.session = { profile: {}, answers: {}, step: 0 };
  assert.match(A.viewAssess(), /Academic stream/);
  A.S.flag = true; assert.match(A.viewAssess(), /choose your stage and stream/);
  A.S.session = { profile: { stage: 'Undergraduate', stream: 'commerce' }, answers: { L1: 1 }, step: 1 };
  assert.match(A.viewAssess(), /Logical|logical|certain/); A.S.session.step = 2;
  const html = A.viewAssess(); assert.match(html, /profit percentage/); assert.doesNotMatch(html, /confounding/);
  A.S.session.step = 99; assert.match(A.viewAssess(), /Review and submit/); A.S.flag = false;
});
test('end to end: answers -> scores -> recommendations -> results, career and skill pages', async () => {
  const p = { stage: 'Undergraduate', stream: 'undecided', subjects: ['Computer Science'] };
  const ans = Object.fromEntries(itemsFor(p).map((it) => [it.id, it.type === 'likert' ? 4 : it.type === 'mcq' ? it.key : it.type === 'sjt' ? it.scores.indexOf(3) : ['tech']]));
  ans.X2 = ['prog', 'data'];
  const scores = scoreAssessment(ans, p), recs = recommend(scores, p, data.index, JSON.parse(fs.readFileSync('public/config/recommender.config.json', 'utf8')));
  localStorage.setItem('novigo:results', JSON.stringify({ at: Date.now(), scores, recs, profile: { stream: p.stream, stage: p.stage } }));
  const html = await A.viewResults();
  for (const r of recs) assert.ok(html.includes(r.title.replace(/&/g, '&amp;')), r.title);
  assert.match(html, /heuristic/); assert.match(html, /not current job demand/);
  const c = await A.viewCareer(recs[0].code);
  assert.match(c, /Skills \(technologies\) and courses/); assert.match(c, /Why it matched you/);
  assert.match(await A.viewCareer('99-9999.99'), /Career not found/);
  assert.match(await A.viewSkill('Spreadsheet software'), /Excel/i);
  assert.match(await A.viewSkill('Geographic information system'), /No suitable course/);
});
test('course cards escape HTML and flag truncated links', () => {
  const base = built.courses.find((c) => c.urlSuspect);
  const html = A.courseCard({ ...base, title: '<img src=x onerror=alert(1)>' });
  assert.doesNotMatch(html, /<img src=x/); assert.match(html, /cut short/);
});
test('course filtering: English default, level and price filters', () => {
  const f = { q: '', level: '', price: '', lang: 'English', subject: '', limit: 30 };
  const eng = A.filterCourses(built.courses, f); assert.ok(eng.length > 0 && eng.every((c) => c.language === 'English'));
  assert.ok(A.filterCourses(built.courses, { ...f, level: 'Advanced' }).every((c) => c.level === 'Advanced'));
  assert.ok(A.filterCourses(built.courses, { ...f, q: 'python' }).every((c) => /python/i.test(`${c.title} ${c.provider} ${c.summary}`)));
});
test('profile page and about page render', async () => { assert.match(await A.viewProfile(), /Delete all my saved data/); assert.match(await A.viewAbout(), /not a clinical test|not career counselling/); });
test('chatbot: grounded answers, honest fallbacks', async () => {
  const q = async (t, ctx = null) => answer(t, ctx, data);
  assert.match((await q('why was I matched with this career?')).text, /do not have your assessment/);
  const s = await q('what skills does a data scientist need'); assert.match(s.text, /Technology categories listed/); assert.ok(s.links[0].href.startsWith('#/career/'));
  const c = await q('courses for python'); assert.match(c.text, /Python/i);
  for (const m of c.text.matchAll(/Courses in the supplied.*?: (.*?)\. Check/g)) assert.ok(m[1].length > 0);
  assert.match((await q('compare accountants and economists')).text, /Hot Technology/);
  assert.match((await q('what is the weather today')).text, /only answer from the supplied/);
  const ctx = { recs: [{ code: '15-2051.00', title: 'Data Scientists', match: 80, why: ['Because reasons.'] }] };
  assert.match((await q('why was I recommended this?', ctx)).text, /Data Scientists \(80\/100/);
  const r = await q('courses for underwater basket weaving'); assert.doesNotMatch(r.text, /Courses in the supplied/);
});
````

---

## tests/data.test.mjs

````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseCsv, toObjects } from '../scripts/lib/csv.mjs';
import { buildAll, parsePrice, hasPhrase, norm } from '../scripts/build-data.mjs';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'novigo-'));
const { q, index, courses, skillCourses } = buildAll(out);
const byId = Object.fromEntries(courses.map((c) => [c.id, c]));
const raw = toObjects(parseCsv(fs.readFileSync('data/raw/software_skills.csv', 'utf8')));

test('csv: quotes, embedded newlines, BOM, CRLF', () => {
  const rows = parseCsv('\ufeffa,b\r\n"x, ""y""","l1\nl2"\r\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, "y"', 'l1\nl2']]);
});
test('csv: malformed and missing-column inputs fail loudly', () => {
  assert.throws(() => parseCsv('a,b\n"oops,1'), /unterminated/);
  assert.throws(() => toObjects(parseCsv('a,b\n1,2'), ['c']), /missing required column/);
  assert.throws(() => toObjects([]), /empty/);
});
test('price parsing', () => {
  assert.deepEqual(parsePrice('FREE-Add a Verified Certificate for $1,299 USD').certificatePriceUSD, 1299);
  assert.equal(parsePrice('FREE').freeToAudit, true);
  assert.equal(parsePrice('???').parsed, false);
});
test('phrase matching respects word boundaries', () => {
  assert.equal(hasPhrase('learn javascript today', 'java'), false);
  assert.equal(hasPhrase('learn java today', 'java'), true);
});
test('every raw skill row survives into the per-occupation files (spot check 300 rows)', () => {
  for (let i = 0; i < raw.length; i += Math.floor(raw.length / 300)) {
    const r = raw[i];
    const d = JSON.parse(fs.readFileSync(path.join(out, 'occ', `${r['O*NET-SOC Code']}.json`), 'utf8'));
    const cat = d.categories.find((c) => c.name === r['Element Name']);
    assert.ok(cat, `category missing for ${r['O*NET-SOC Code']}`);
    const p = cat.products.find((x) => x.n === r['Workplace Example']);
    assert.ok(p);
    if (r['Hot Technology'] === 'Y') assert.equal(p.hot, true);
  }
  assert.equal(index.length, q.skills.occupations);
});
test('courses: no duplicate URLs or ids; two datasets joined only on title match', () => {
  assert.equal(new Set(courses.map((c) => c.url)).size, courses.length);
  assert.equal(new Set(courses.map((c) => c.id)).size, courses.length);
  const withHist = courses.filter((c) => c.history);
  assert.equal(withHist.length, q.appendix.matchedToEdx);
  assert.ok(withHist.length > 0);
  for (const c of withHist) assert.ok(c.history.pctCertified >= 0 && c.history.pctCertified <= 100);
});
test('skill->course: ids exist, text evidence required, max 6, no duplicates, nothing invented', () => {
  for (const [cat, v] of Object.entries(skillCourses)) {
    assert.ok(v.courses.length <= 6);
    assert.equal(new Set(v.courses.map((c) => c.id)).size, v.courses.length, cat);
    for (const c of v.courses) {
      assert.ok(byId[c.id], `${cat}: unknown course ${c.id}`);
      assert.ok(c.reasons.some((r) => !r.type.includes('inferred')), `${cat}: subject-only match`);
    }
    if (!v.mapped) for (const c of v.courses) assert.ok(c.reasons.every((r) => r.type.startsWith('product-')), `${cat}: unmapped category used keywords`);
  }
});
test('matched reasons are reproducible from course text', () => {
  const c0 = skillCourses['Spreadsheet software'].courses[0];
  const c = byId[c0.id];
  const text = `${c.title} ${c.summary} ${c.description}`.toLowerCase();
  assert.ok(c0.reasons.filter((r) => !r.type.includes('inferred')).every((r) => hasPhrase(text, r.term)));
});
test('categories with no evidence return empty rather than filler', () => {
  assert.equal(skillCourses['Geographic information system'].courses.length, 0);
  assert.ok(Object.values(skillCourses).some((v) => v.courses.length === 0));
});
test('norm', () => assert.equal(norm('  C++ / R!  '), 'c r'));
````

---

## tests/engine.test.mjs

````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildAll } from '../scripts/build-data.mjs';
import { ITEMS } from '../public/js/assessment/questions.js';
import { itemsFor, scoreAssessment } from '../public/js/assessment/scoring.js';
import { recommend } from '../public/js/engine.js';

const { index } = buildAll(fs.mkdtempSync(path.join(os.tmpdir(), 'novigo-e-')));
const cfg = JSON.parse(fs.readFileSync('public/config/recommender.config.json', 'utf8'));
const profile = { stream: 'science', subjects: [] };
const make = (f, p = profile) => scoreAssessment(Object.fromEntries(itemsFor(p).map((it) => [it.id, f(it)])), p);
const hi = (dims) => (it) => (dims.includes(it.dim) ? (it.type === 'likert' ? (it.reverse ? 1 : 5) : it.type === 'mcq' ? it.key : it.scores?.indexOf(3)) : it.type === 'likert' ? (it.reverse ? 5 : 1) : it.type === 'mcq' ? (it.key + 1) % 4 : it.scores?.indexOf(0));

test('config has a profile for every SOC group present in the data', () => {
  for (const g of new Set(index.map((o) => o.g))) assert.ok(cfg.groups[g], `no profile for SOC ${g}`);
  for (const g of Object.values(cfg.groups)) { assert.equal(g.cog.length, 5); assert.equal(g.int.length, 6); assert.equal(g.ws.length, 4); }
});
test('recommendations come from the dataset, are sorted, capped per group, and meet the minimum data rule', () => {
  const recs = recommend(make(hi(['I', 'logical', 'pattern'])), profile, index, cfg);
  assert.ok(recs.length > 0 && recs.length <= cfg.topN);
  const per = {};
  recs.forEach((r, i) => {
    const o = index.find((x) => x.c === r.code); assert.ok(o); assert.ok(o.n >= cfg.minTechRecords);
    per[r.group] = (per[r.group] || 0) + 1; assert.ok(per[r.group] <= cfg.maxPerGroup);
    assert.ok(r.match <= 99 && r.why.length > 0); if (i) assert.ok(recs[i - 1].match >= r.match);
    assert.equal(r.market.hot, o.hot);
  });
});
test('different profiles give different recommendations', () => {
  const tech = recommend(make(hi(['I', 'logical', 'numerical', 'pattern'])), profile, index, cfg);
  const care = recommend(make(hi(['S', 'empathy', 'awareness', 'verbal'])), profile, index, cfg);
  assert.notDeepEqual(tech.map((r) => r.code), care.map((r) => r.code));
  const groups = (r) => new Set(r.map((x) => x.group));
  assert.ok(['15', '17', '19'].some((g) => groups(tech).has(g)), 'analytical profile should surface a STEM group: ' + [...groups(tech)]);
  assert.ok(['21', '25', '29', '31', '39'].some((g) => groups(care).has(g)), 'helping profile should surface a people group: ' + [...groups(care)]);
});
test('weights are configurable without code changes', () => {
  const sc = make(hi(['A', 'creative']));
  const base = recommend(sc, profile, index, cfg).map((r) => r.match);
  const alt = recommend(sc, profile, index, { ...cfg, weights: { aptitude: 0, interest: 1, ei: 0, workStyle: 0, tools: 0 } }).map((r) => r.match);
  assert.notDeepEqual(base, alt);
});
test('explore choice adds a visible, explained bonus; stream never filters', () => {
  const sc = make(() => 3), sc2 = { ...sc, exploreGroups: ['27'] };
  const withX = recommend(sc2, { stream: 'science' }, index, { ...cfg, topN: 30, maxPerGroup: 30 });
  const arts = withX.filter((r) => r.group === '27'); assert.ok(arts.length > 0);
  assert.ok(arts.every((r) => r.bonuses.some((b) => b.type === 'explore') && r.why.some((w) => /explore/i.test(w))));
  const groupsShown = new Set(recommend(sc, { stream: 'commerce' }, index, { ...cfg, topN: 5000, maxPerGroup: 5000 }).map((r) => r.group));
  const eligible = new Set(index.filter((o) => o.n >= cfg.minTechRecords).map((o) => o.g));
  assert.equal(groupsShown.size, eligible.size, 'a commerce user must still be scored against every eligible group');
});
test('sparse data: no answers gives no recommendations; tiny index gives fewer than topN', () => {
  assert.deepEqual(recommend(scoreAssessment({}, profile), profile, index, cfg), []);
  assert.ok(recommend(make(() => 3), profile, index.slice(0, 3), cfg).length <= 3);
});
test('tool interest changes within-group ordering', () => {
  const base = make(() => 3);
  const withTools = { ...base, toolCategoryHints: ['spreadsheet', 'accounting', 'financial analysis'] };
  const a = recommend(base, profile, index, { ...cfg, topN: 5 }).map((r) => r.code), b = recommend(withTools, profile, index, { ...cfg, topN: 5 }).map((r) => r.code);
  assert.notDeepEqual(a, b);
});
````

---

## tests/scoring.test.mjs

````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, DIMENSIONS } from '../public/js/assessment/questions.js';
import { itemsFor, validate, itemScore, scoreAssessment } from '../public/js/assessment/scoring.js';

const best = (it) => it.type === 'mcq' ? it.key : it.type === 'sjt' ? it.scores.indexOf(Math.max(...it.scores)) : it.type === 'likert' ? (it.reverse ? 1 : 5) : [];
const worst = (it) => it.type === 'mcq' ? (it.key + 1) % it.options.length : it.type === 'sjt' ? it.scores.indexOf(Math.min(...it.scores)) : it.type === 'likert' ? (it.reverse ? 5 : 1) : [];
const answerAll = (items, f) => Object.fromEntries(items.map((it) => [it.id, f(it)]));

test('item bank integrity', () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length, 'duplicate ids');
  for (const it of ITEMS) {
    if (it.type === 'mcq') { assert.ok(it.key >= 0 && it.key < it.options.length, it.id); assert.equal(new Set(it.options).size, it.options.length, it.id); }
    if (it.type === 'sjt') { assert.equal(it.scores.length, it.options.length, it.id); assert.equal(Math.max(...it.scores), 3); assert.equal(Math.min(...it.scores), 0); }
    if (it.type !== 'multi') assert.ok(DIMENSIONS[it.dim], `${it.id} unknown dim`);
  }
  for (const d of Object.keys(DIMENSIONS)) assert.ok(ITEMS.filter((i) => i.dim === d).length >= 1, `no items for ${d}`);
  for (const d of ['logical', 'numerical', 'verbal', 'pattern']) assert.ok(itemsFor({ stream: 'science' }).filter((i) => i.dim === d).length >= 2, d);
});
test('stream branching', () => {
  const ids = (p) => itemsFor(p).map((i) => i.id);
  assert.ok(ids({ stream: 'science' }).includes('S2') && !ids({ stream: 'science' }).includes('C1') && !ids({ stream: 'science' }).includes('H1'));
  assert.ok(ids({ stream: 'commerce' }).includes('C2') && !ids({ stream: 'commerce' }).includes('S1'));
  assert.ok(ids({ stream: 'humanities' }).includes('H2') && !ids({ stream: 'humanities' }).includes('C2'));
  for (const p of [{ stream: 'undecided' }, {}, { stream: 'other' }]) { const x = ids(p); assert.ok(['S1', 'C1', 'H1'].every((i) => x.includes(i)) && !['S2', 'C2', 'H2'].includes(x.find((i) => ['S2', 'C2', 'H2'].includes(i)))); }
  assert.ok(ids({ stream: 'science' }).includes('L1') && ids({ stream: 'commerce' }).includes('L1'));
});
test('objective scoring uses answer keys; subjective uses rubric; reverse items flip', () => {
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  assert.equal(itemScore(byId.N1, 1), 100); assert.equal(itemScore(byId.N1, 0), 0);
  assert.equal(itemScore(byId.A1, 1), 100); assert.ok(Math.abs(itemScore(byId.A1, 3) - 100 / 3) < 1e-9);
  assert.equal(itemScore(byId.K1, 5), 100); assert.equal(itemScore(byId.K2, 5), 0); assert.equal(itemScore(byId.K2, 1), 100);
  assert.equal(itemScore(byId.K1, 9), null); assert.equal(itemScore(byId.N1, undefined), null);
});
test('best vs worst answers produce 100 vs 0 on every scored dimension', () => {
  for (const stream of ['science', 'commerce', 'humanities', 'undecided']) {
    const items = itemsFor({ stream });
    const hi = scoreAssessment(answerAll(items, best), { stream }), lo = scoreAssessment(answerAll(items, worst), { stream });
    for (const grp of [hi.cognitive, hi.ei, hi.interests, hi.workStyle]) for (const v of Object.values(grp)) assert.equal(v, 100, stream);
    for (const grp of [lo.cognitive, lo.interests, lo.workStyle]) for (const v of Object.values(grp)) assert.equal(v, 0, stream);
    assert.equal(hi.meta.answered, hi.meta.total);
  }
});
test('validation flags missing required answers; multi-select is optional', () => {
  const items = itemsFor({ stream: 'science' });
  const v = validate(items, {});
  assert.equal(v.ok, false); assert.ok(v.missing.includes('L1') && !v.missing.includes('X1'));
  assert.equal(validate(items, answerAll(items, best)).ok, true);
});
test('unanswered dimensions are null, not zero', () => {
  const r = scoreAssessment({ L1: 1 }, { stream: 'science' });
  assert.equal(r.cognitive.logical, 100); assert.equal(r.cognitive.numerical, null); assert.equal(r.ei.empathy, null);
});
test('multi-select answers map to SOC groups and tool hints', () => {
  const r = scoreAssessment({ X1: ['tech', 'arts'], X2: ['data'] }, { stream: 'commerce' });
  assert.deepEqual(r.exploreGroups.sort(), ['15', '27']);
  assert.deepEqual(r.toolGroups, ['data']); assert.ok(r.toolCategoryHints.includes('spreadsheet'));
  assert.deepEqual(scoreAssessment({}, {}).exploreGroups, []);
});
test('different answers change the profile (not a fixed output)', () => {
  const items = itemsFor({ stream: 'science' });
  const a = scoreAssessment(answerAll(items, best), { stream: 'science' });
  const b = scoreAssessment(answerAll(items, (it) => (it.dim === 'R' || it.dim === 'I' ? best(it) : worst(it))), { stream: 'science' });
  assert.notDeepEqual(a.interests, b.interests); assert.equal(b.interests.A, 0); assert.equal(b.interests.R, 100);
});
````
