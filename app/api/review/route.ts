import { ownerId, rateHit, readJson, tooMany, json } from '@/lib/http';
import { parseReviewBody } from '@/lib/validate';
import { addReview } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const input = parseReviewBody(body.body);
  if (!input) return json({ error: 'Provide datasetId, decision (training-ready|needs-changes|rejected), and an optional note' }, 400);
  const lim = await rateHit(owner, 'review', 120);
  if (!lim.ok) return tooMany(lim.retryAfter);
  try {
    await addReview(owner, input.datasetId, input.decision, input.note);
  } catch {
    return json({ error: 'Unknown dataset' }, 404);
  }
  return json({ ok: true });
}
