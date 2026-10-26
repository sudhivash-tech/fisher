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
