import CurationBench from '@/components/CurationBench';
import { board } from '@/lib/repo';
import { ownerId } from '@/lib/http';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const owner = await ownerId();
  const b = await board(owner);
  const ready = b.queue.filter((q) => q.scores.readiness >= 70).length;
  return (
    <main>
      <div className="mt-6 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Eight datasets want to become training data. Most are not ready.</h1>
        <p className="mt-2 text-sm text-mute">
          The bench scored a fictional registry on quality, coverage and bias with explicit rules; {ready} of {b.queue.length} clear a 70-point readiness bar.
          Every deduction is listed next to its score. Your review decisions persist in the demo database under your anonymous cookie. {b.note}
        </p>
      </div>
      <CurationBench initial={b} />
    </main>
  );
}
