// Dependency-free RFC 4180 CSV parser. Throws on malformed input instead of guessing.
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = [];
    } else field += c;
  }
  if (inQuotes) throw new Error('Malformed CSV: unterminated quoted field');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function toObjects(rows, requiredColumns = []) {
  if (!rows.length) throw new Error('CSV is empty');
  const head = rows[0].map((h) => h.trim());
  const missing = requiredColumns.filter((c) => !head.includes(c));
  if (missing.length) throw new Error(`CSV is missing required column(s): ${missing.join(', ')}`);
  return rows.slice(1)
    .filter((r) => !(r.length === 1 && r[0] === ''))
    .map((r) => Object.fromEntries(head.map((k, j) => [k, (r[j] ?? '').trim()])));
}
