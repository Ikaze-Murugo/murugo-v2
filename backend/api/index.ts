/**
 * Vercel serverless entry. All routes are rewritten here.
 * Use Supabase for Postgres; Redis is optional (skip on Vercel).
 * Real-time: use Supabase Realtime or polling (Socket.io does not run on serverless).
 */
// Use compiled app so build step (npm run build) must run before deploy
// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('../dist/app').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connectDatabase } = require('../dist/database/connection');

let dbReady: Promise<void> | null = null;

function getDbReady(): Promise<void> {
  if (!dbReady) {
    dbReady = connectDatabase();
  }
  return dbReady;
}

export default async function handler(req: unknown, res: unknown): Promise<void> {
  await getDbReady();
  (app as (req: unknown, res: unknown) => void)(req, res);
}
