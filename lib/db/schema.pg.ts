import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  datasetId: text('dataset_id').notNull(),
  decision: text('decision').notNull(),
  note: text('note').notNull(),
  createdAt: text('created_at').notNull(),
});
export const rateEvents = pgTable('rate_events', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(),
  at: integer('at').notNull(),
});
