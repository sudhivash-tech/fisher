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
