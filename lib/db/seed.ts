import type { Db } from './index';

/**
 * The shared sample registry ships as static JSON in data/datasets.json, not in the DB.
 * Per-owner review decisions start empty. Nothing to seed.
 */
export async function seedIfEmpty(_db: Db): Promise<void> {}
