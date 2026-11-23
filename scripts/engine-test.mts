import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { scoreDataset, rankQueue } from '../lib/engine.ts';
import type { DatasetRecord } from '../lib/types.ts';

const reg = JSON.parse(readFileSync(new URL('../data/datasets.json', import.meta.url), 'utf8')) as { targets: Record<string, number>; datasets: DatasetRecord[] };

// Bounds and determinism
for (const ds of reg.datasets) {
  const s = scoreDataset(ds, reg.targets);
  assert.ok(s.quality >= 0 && s.quality <= 1 && s.coverage >= 0 && s.coverage <= 1 && s.bias >= 0 && s.bias <= 1, `${ds.id} bounds`);
  assert.ok(s.readiness >= 0 && s.readiness <= 100, `${ds.id} readiness bounds`);
  assert.deepEqual(scoreDataset(ds, reg.targets), s, `${ds.id} deterministic`);
}
// Single-batch dataset gets the batch penalty and a reason
const neuron = reg.datasets.find((d) => d.id === 'ds-neuron')!;
const ns = scoreDataset(neuron, reg.targets);
assert.ok(ns.reasons.some((r) => r.includes('single batch')), 'single-batch reason');
// High-duplicate dataset flagged
assert.ok(ns.reasons.some((r) => r.includes('duplicates')), 'duplicate reason for 11% dup rate');
// Consent re-contact flagged
const serum = scoreDataset(reg.datasets.find((d) => d.id === 'ds-serum')!, reg.targets);
assert.ok(serum.reasons.some((r) => r.includes('re-contact')), 'consent reason');
// Perfect record scores high
const perfect = scoreDataset({ id: 'x', name: 'x', modality: 'scRNA-seq', samples: 50000, missingRate: 0, duplicateRate: 0, batches: 6, positiveShare: 0.5, intendedUse: 'x', license: 'CC0', consentScope: 'broad research use' }, reg.targets);
assert.equal(perfect.readiness, 100, `perfect record scores 100, got ${perfect.readiness}`);
// Queue sorted desc, best dataset first
const q = rankQueue(reg.datasets, reg.targets);
for (let i = 1; i < q.length; i++) assert.ok(q[i - 1].scores.readiness >= q[i].scores.readiness, 'sorted');
assert.ok(q[0].scores.readiness >= 85, 'top of queue is a strong record');
console.log('engine tests pass');
