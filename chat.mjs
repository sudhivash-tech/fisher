// Netlify Function: grounded career chatbot. Uses an AI model only if ANTHROPIC_API_KEY is set; otherwise dataset retrieval.
// The key is read from the environment and never sent to the browser.
import fs from 'node:fs';
import path from 'node:path';
import { answer } from '../../public/js/chat/retrieval.js';

const roots = [process.env.LAMBDA_TASK_ROOT && path.join(process.env.LAMBDA_TASK_ROOT, 'public/data'), path.join(process.cwd(), 'public/data')].filter(Boolean);
const dataDir = roots.find((r) => fs.existsSync(path.join(r, 'occupations-index.json')));
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
let cache;
const data = () => (cache ??= { index: readJson('occupations-index.json'), courses: readJson('courses.json'), loadOcc: async (c) => readJson(`occ/${String(c).replace(/[^0-9.\-]/g, '')}.json`) });

const hits = new Map();
const limited = (ip) => { const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < 60000); a.push(now); hits.set(ip, a); return a.length > 10; }; // best-effort, per warm instance
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (!dataDir) return json(500, { error: 'Data files not found on the server. Run "npm run build:data" and redeploy.' });
  if (limited(context?.ip || req.headers.get('x-nf-client-connection-ip') || 'anon')) return json(429, { error: 'Too many requests' });
  let body; try { body = await req.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  if (!msgs.length || msgs.some((m) => !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 1000) || msgs.at(-1).role !== 'user') return json(400, { error: 'Invalid messages' });
  const ctx = body.context?.recs ? { recs: body.context.recs.slice(0, 5).map((r) => ({ code: String(r.code), title: String(r.title).slice(0, 120), match: Number(r.match) || 0, why: (r.why || []).slice(0, 6).map((w) => String(w).slice(0, 240)) })) } : null;
  const question = msgs.at(-1).content;
  const grounded = await answer(question, ctx, data());
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(200, grounded);
  try {
    const system = `You are Novigo's career guide. Answer using ONLY the FACTS below plus the user's results when provided. Never invent courses, links, salaries, demand, hiring or statistics. Market information is limited to O*NET Hot Technology / In Demand flags on technologies. Cognitive and emotional indicators are exploratory, not diagnostic. If the facts do not cover the question, say so briefly and suggest what you can answer. Be concise.\nFACTS: ${grounded.text}\nUSER RESULTS: ${ctx ? JSON.stringify(ctx.recs) : 'not shared'}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.CHAT_MODEL || 'claude-sonnet-5-5', max_tokens: 500, system, messages: msgs }) });
    if (!r.ok) return json(200, grounded);
    const j = await r.json();
    const text = j.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    return json(200, text ? { text, links: grounded.links, mode: 'ai' } : grounded);
  } catch { return json(200, grounded); }
};
