# Bio Curation Bench

Independent demo: score a fictional biomedical dataset registry on quality, coverage and bias with transparent rules, and route datasets through a human review queue before anything is marked training-ready, the curation problem behind biology foundation models.

- Rule-based quality, coverage and bias scoring per dataset; every score shows its reasons
- Review queue: approve, flag or reject datasets before they count as training-ready
- Real persisted state per anonymous browser cookie: reviews and decisions
- Sample registry is fictional; dataset names, assays and metrics are seeded demo data, not real studies

Stack: Next.js 15, drizzle-orm, SQLite locally, Postgres (Neon) in production via DATABASE_URL.

## Run

```
npm install
npm run dev        # http://localhost:3000
npm test           # engine unit tests
npm run typecheck
BASE_URL=http://localhost:3000 npm run e2e   # with the dev server running
```

## Deployment

Production deploys run on Vercel from the main branch, with the database on Neon Postgres connected through the Vercel integration.

Demo built by Vinil Polepalli. Not affiliated with or endorsed by Osseus.
