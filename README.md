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
