import type { DatasetRecord, Scores } from './types';

export type Targets = Record<string, number>;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Deterministic, rule-based scoring - every deduction is listed in `reasons` and shown in the UI.
 * No ML anywhere in this demo.
 */
export function scoreDataset(ds: DatasetRecord, targets: Targets): Scores {
  const reasons: string[] = [];

  // Quality: penalize missing and duplicate rates.
  let quality = 1 - ds.missingRate * 2 - ds.duplicateRate * 1.5;
  if (ds.missingRate > 0.1) reasons.push(`${Math.round(ds.missingRate * 100)}% missing values (over the 10% line)`);
  if (ds.duplicateRate > 0.05) reasons.push(`${Math.round(ds.duplicateRate * 100)}% suspected duplicates (over the 5% line)`);
  quality = clamp01(quality);

  // Coverage: samples vs a per-modality target for the intended use.
  const target = targets[ds.modality] ?? 10000;
  const coverage = clamp01(ds.samples / target);
  if (coverage < 1) reasons.push(`${ds.samples.toLocaleString()} samples vs a ${target.toLocaleString()} target for ${ds.modality}`);

  // Bias: class balance and batch confounds.
  let bias = 1;
  const imbalance = Math.abs(ds.positiveShare - 0.5) * 2; // 0 = perfect balance
  bias -= imbalance * 0.4;
  if (imbalance > 0.5) reasons.push(`class balance is ${Math.round(ds.positiveShare * 100)}% positive, far from 50/50`);
  if (ds.batches === 1) { bias -= 0.35; reasons.push('single batch: batch effects cannot be separated from biology'); }
  else if (ds.batches < 3) { bias -= 0.15; reasons.push(`only ${ds.batches} batches: limited power to model batch effects`); }
  bias = clamp01(bias);

  if (ds.consentScope.includes('re-contact')) reasons.push('consent scope requires re-contact before broader use');
  if (ds.license === 'undecided') reasons.push('license undecided');

  const readiness = Math.round((quality * 0.4 + coverage * 0.3 + bias * 0.3) * 100);
  return { quality, coverage, bias, readiness, reasons };
}

export function rankQueue(datasets: DatasetRecord[], targets: Targets): { ds: DatasetRecord; scores: Scores }[] {
  return datasets
    .map((ds) => ({ ds, scores: scoreDataset(ds, targets) }))
    .sort((a, b) => b.scores.readiness - a.scores.readiness);
}
