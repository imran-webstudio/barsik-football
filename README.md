# Barsik Football Tournament

Registration site for the annual Barsik football tournament, built with the T3 stack (Next.js, tRPC, Drizzle, Tailwind) and Neon Postgres.

Players register at `/`. Organizers review submissions at `/dashboard`.

## Local setup

```bash
cp .env.example .env
# fill DATABASE_URL, AUTH_SECRET, and ADMIN_PASSWORD
npm install
npm run db:push
npm run dev
```

The database is a Neon project named `barsik-football` (the Postgres used with Vercel). Connection details live only in `.env`.
