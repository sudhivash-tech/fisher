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
