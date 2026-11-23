const base = process.env.BASE_URL ?? 'http://localhost:3000';
const jar: string[] = [];
async function call(path: string, init?: RequestInit) {
  const res = await fetch(base + path, { ...init, headers: { ...(init?.headers ?? {}), cookie: jar.join('; '), 'content-type': 'application/json' } });
  for (const c of res.headers.getSetCookie?.() ?? []) jar.push(c.split(';')[0]);
  return res;
}
const home = await call('/');
if (home.status !== 200) throw new Error(`home ${home.status}`);
const html = await home.text();
if (!html.includes('Eight datasets')) throw new Error('home missing heading');
if (!html.includes('readiness')) throw new Error('scores missing');
const rev = await call('/api/review', { method: 'POST', body: JSON.stringify({ datasetId: 'ds-discharge', decision: 'training-ready', note: 'clean consent and balance' }) });
if (rev.status !== 200) throw new Error(`review ${rev.status}: ${await rev.text()}`);
const bad = await call('/api/review', { method: 'POST', body: JSON.stringify({ datasetId: 'ds-discharge', decision: 'maybe' }) });
if (bad.status !== 400) throw new Error(`expected 400, got ${bad.status}`);
const nf = await call('/api/review', { method: 'POST', body: JSON.stringify({ datasetId: 'ds-nope', decision: 'rejected' }) });
if (nf.status !== 404) throw new Error(`expected 404, got ${nf.status}`);
const home2 = await call('/');
const html2 = await home2.text();
if (!html2.includes('training-ready')) throw new Error('decision not reflected');
if (!html2.includes('clean consent and balance')) throw new Error('note not persisted');
console.log('e2e pass');
