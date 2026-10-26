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
