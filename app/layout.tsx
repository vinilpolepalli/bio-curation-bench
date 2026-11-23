import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bio Curation Bench: which datasets are ready to train on',
  description: 'Independent demo: rule-based quality, coverage and bias scores for a fictional biomedical dataset registry, with a review queue before anything is marked training-ready. Sample registry is fictional; not affiliated with Osseus.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen font-sans antialiased">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
          <Link href="/" className="text-base font-semibold text-ink">Bio Curation Bench <span className="font-normal text-mute">independent demo</span></Link>
          <nav className="flex gap-5 text-sm"><Link className="text-ink hover:text-accent" href="/">Review queue</Link></nav>
        </header>
        {children}
        <footer className="mt-12 border-t border-line py-5 text-xs leading-relaxed text-mute">
          Demo built by Vinil Polepalli. The registry and its eight datasets are fictional sample data; scores come from explicit rules with every deduction listed, not from machine learning. Review decisions you make are stored in this demo's database under an anonymous browser cookie. Independent demo; not affiliated with or endorsed by Osseus.
        </footer>
      </div>
    </body></html>
  );
}
