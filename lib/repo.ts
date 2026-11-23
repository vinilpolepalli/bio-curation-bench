import { desc, eq } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from './db';
import { rankQueue } from './engine';
import type { DatasetRecord, Decision, ReviewEvent } from './types';

type Registry = { note: string; targets: Record<string, number>; datasets: DatasetRecord[] };

let cache: Registry | null = null;
export function registry(): Registry {
  if (!cache) cache = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data/datasets.json'), 'utf8')) as Registry;
  return cache;
}

export async function addReview(ownerId: string, datasetId: string, decision: Decision, note: string): Promise<void> {
  if (!registry().datasets.some((d) => d.id === datasetId)) throw new Error('unknown dataset');
  const db = await getDb();
  await db.orm.insert(db.t.reviews).values({ ownerId, datasetId, decision, note, createdAt: new Date().toISOString() });
}

export async function reviewLog(ownerId: string, limit = 50): Promise<ReviewEvent[]> {
  const db = await getDb();
  const rows = await db.orm.select().from(db.t.reviews).where(eq(db.t.reviews.ownerId, ownerId)).orderBy(desc(db.t.reviews.id)).limit(limit);
  return rows.map((r) => ({ datasetId: r.datasetId, decision: r.decision as Decision, note: r.note, at: r.createdAt }));
}

/** Queue ranked by readiness, with this owner's latest decision per dataset. */
export async function board(ownerId: string) {
  const reg = registry();
  const log = await reviewLog(ownerId);
  const latest: Record<string, ReviewEvent> = {};
  for (const r of log) if (!(r.datasetId in latest)) latest[r.datasetId] = r; // log is newest-first
  const queue = rankQueue(reg.datasets, reg.targets).map(({ ds, scores }) => ({
    ...ds, scores, current: latest[ds.id] ?? null,
  }));
  const reviewedCount = Object.keys(latest).length;
  return { note: reg.note, queue, log: log.slice(0, 20), reviewedCount };
}
