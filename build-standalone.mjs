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
