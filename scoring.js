// Pure scoring logic (browser + Node). Scoring rules are documented in docs/SCORING.md.
import { ITEMS, DIMENSIONS, VERSION } from './questions.js';

export const STREAMS = ['science', 'commerce', 'humanities'];

// Which items a user sees. Common items always; stream items for their branch; undecided/other get one sampler item per stream.
export function itemsFor(profile = {}, items = ITEMS) {
  const stream = profile.stream;
  return items.filter((it) => {
    if (!it.stream) return true;
    if (STREAMS.includes(stream)) return it.stream === stream;
    return !!it.sampler;
  });
}

const isAnswered = (it, a) => {
  if (a === undefined || a === null) return false;
  if (it.type === 'multi') return Array.isArray(a); // an empty selection is a valid answer
  if (it.type === 'likert') return Number.isInteger(a) && a >= 1 && a <= 5;
  return Number.isInteger(a) && a >= 0 && a < it.options.length;
};

// Required-field validation. Multi-select items are optional.
export function validate(items, answers) {
  const missing = items.filter((it) => it.type !== 'multi' && !isAnswered(it, answers[it.id])).map((it) => it.id);
  return { ok: missing.length === 0, missing };
}

// 0-100 per item. Returns null if unanswered.
export function itemScore(it, a) {
  if (!isAnswered(it, a)) return null;
  if (it.type === 'mcq') return a === it.key ? 100 : 0;
  if (it.type === 'sjt') return (it.scores[a] / 3) * 100;
  if (it.type === 'likert') return ((it.reverse ? 6 - a : a) - 1) * 25;
  return null;
}

export function scoreAssessment(answers, profile = {}, items = ITEMS) {
  const shown = itemsFor(profile, items);
  const buckets = {};
  let answered = 0;
  for (const it of shown) {
    if (it.type === 'multi') continue;
    const s = itemScore(it, answers[it.id]);
    if (s === null) continue;
    answered++;
    (buckets[it.dim] ??= []).push(s);
  }
  const dim = (d) => (buckets[d]?.length ? Math.round(buckets[d].reduce((x, y) => x + y, 0) / buckets[d].length) : null);
  const pick = (kind) => Object.fromEntries(Object.entries(DIMENSIONS).filter(([, m]) => m.kind === kind).map(([d]) => [d, dim(d)]));
  const chosen = (target) => {
    const it = shown.find((i) => i.target === target);
    const sel = Array.isArray(answers[it?.id]) ? answers[it.id] : [];
    return it ? it.options.filter((o, i) => sel.includes(o.id ?? i)) : [];
  };
  return {
    version: VERSION,
    cognitive: pick('cognitive'), creative: dim('creative'), ei: pick('ei'),
    interests: pick('interest'), workStyle: pick('workstyle'),
    exploreGroups: [...new Set(chosen('explore').flatMap((o) => o.soc))],
    toolGroups: chosen('tools').map((o) => o.id),
    toolCategoryHints: [...new Set(chosen('tools').flatMap((o) => o.cats))],
    meta: { answered, total: shown.filter((i) => i.type !== 'multi').length, stream: profile.stream ?? 'undecided' }
  };
}
