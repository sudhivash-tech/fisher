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
