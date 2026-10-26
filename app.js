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
