import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `barsik-football_${name}`);

export const registrations = createTable(
  "registration",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 120 }).notNull(),
    father: d.varchar({ length: 120 }).notNull(),
    age: d.integer().notNull(),
    village: d.varchar({ length: 160 }).notNull(),
    location: d.varchar({ length: 160 }).notNull(),
    mobile: d.varchar({ length: 20 }).notNull(),
    position: d.varchar({ length: 32 }).notNull(),
    payer: d.varchar({ length: 20 }),
    trxid: d.varchar({ length: 64 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("mobile_idx").on(t.mobile),
    index("position_idx").on(t.position),
    index("created_idx").on(t.createdAt),
  ],
);
