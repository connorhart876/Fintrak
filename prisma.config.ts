import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: {
    externalTables: true,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
    // Runs against the temporary shadow database only — never the real Supabase
    // DB. Supabase provides the `auth` schema and `auth.uid()` in production;
    // the shadow DB is a plain Postgres, so we stub them here so migrations
    // that reference `auth.uid()` can be validated.
    initShadowDb: `
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
        SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$ LANGUAGE sql STABLE;
    `,
  },
  datasource: {
    // Use the direct URL (port 5432) for CLI operations — migrations need prepared
    // statements that pgBouncer transaction mode (port 6543) doesn't support.
    url: process.env["DIRECT_URL"]!,
  },
});
