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
