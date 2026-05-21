import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the direct URL (port 5432) for CLI operations — migrations need prepared
    // statements that pgBouncer transaction mode (port 6543) doesn't support.
    url: process.env["DIRECT_URL"]!,
  },
});
