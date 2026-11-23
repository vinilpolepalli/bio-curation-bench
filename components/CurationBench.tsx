'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Panel, btn2 } from './ui';
import { fmtDate, pct } from '@/lib/format';
import type { DatasetRecord, Decision, ReviewEvent, Scores } from '@/lib/types';

export type QueueItem = DatasetRecord & { scores: Scores; current: ReviewEvent | null };
export type BenchState = { note: string; queue: QueueItem[]; log: ReviewEvent[]; reviewedCount: number };

const DECISIONS: { id: Decision; label: string }[] = [
  { id: 'training-ready', label: 'Mark training-ready' },
  { id: 'needs-changes', label: 'Request changes' },
  { id: 'rejected', label: 'Reject' },
];

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-mute">{label}</span>
      <div className="h-1.5 w-24 rounded bg-line"><div className="h-1.5 rounded bg-accent" style={{ width: `${Math.round(value * 100)}%` }} /></div>
      <span className="tabular-nums text-mute">{Math.round(value * 100)}</span>
    </div>
  );
}

export default function CurationBench({ initial }: { initial: BenchState }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const decide = (datasetId: string, decision: Decision) =>
    start(async () => {
      setErr(null);
      const res = await fetch('/api/review', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, decision, note: note[datasetId] ?? '' }),
      });
      if (!res.ok) { setErr((await res.json().catch(() => ({}))).error ?? `Request failed (${res.status})`); return; }
      router.refresh();
    });

  return (
    <div className="mt-6 grid gap-4 pb-10 lg:grid-cols-3">
      {err && <div className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-800 lg:col-span-3">{err}</div>}

      <div className="space-y-4 lg:col-span-2">
        {initial.queue.map((q) => (
          <Panel key={q.id} title={`${q.name}`} right={<span className={`rounded px-2 py-0.5 text-xs font-medium ${q.scores.readiness >= 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>readiness {q.scores.readiness}</span>}>
            <div className="text-xs text-mute">{q.modality} | {q.samples.toLocaleString()} samples | {q.batches} batch{q.batches === 1 ? '' : 'es'} | {q.license}</div>
            <div className="mt-1 text-sm text-ink">Intended use: {q.intendedUse}</div>
            <div className="mt-1 text-xs text-mute">Consent scope: {q.consentScope}</div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <Bar label="quality" value={q.scores.quality} />
              <Bar label="coverage" value={q.scores.coverage} />
              <Bar label="bias" value={q.scores.bias} />
            </div>
            {q.scores.reasons.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-mute">
                {q.scores.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            {q.current && (
              <div className="mt-2 rounded-ctl bg-line/40 px-3 py-1.5 text-xs text-ink">
                Your latest decision: <span className="font-medium">{q.current.decision}</span> ({fmtDate(q.current.at)}){q.current.note ? ` - ${q.current.note}` : ''}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input value={note[q.id] ?? ''} onChange={(ev) => setNote((n) => ({ ...n, [q.id]: ev.target.value }))}
                placeholder="optional note" className="w-48 rounded-ctl border border-line bg-white px-2 py-1.5 text-xs text-ink" />
              {DECISIONS.map((d) => (
                <button key={d.id} disabled={pending} className={btn2} onClick={() => decide(q.id, d.id)}>{d.label}</button>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel title={`Decision log (${initial.reviewedCount} of ${initial.queue.length} reviewed)`}>
        {initial.log.length === 0 ? (
          <p className="text-sm text-mute">No decisions yet. Every decision you record appears here with its timestamp and note.</p>
        ) : (
          <ul className="space-y-2">
            {initial.log.map((r, i) => (
              <li key={i} className="text-sm">
                <div className="text-ink"><span className="font-medium">{r.decision}</span> on {initial.queue.find((q) => q.id === r.datasetId)?.name ?? r.datasetId}</div>
                <div className="text-xs text-mute">{fmtDate(r.at)}{r.note ? ` - ${r.note}` : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
