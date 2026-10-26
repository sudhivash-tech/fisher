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
