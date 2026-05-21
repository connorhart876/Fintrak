import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const DEFAULT_CATEGORIES = [
  "Bills",
  "Entertainment",
  "Food",
  "Health",
  "Other",
  "Shopping",
  "Transport",
];

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  for (const name of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name, userId: null },
    });
    if (existing) {
      console.log(`= ${name} (already seeded)`);
    } else {
      await prisma.category.create({
        data: { name, userId: null, isDefault: true },
      });
      console.log(`+ ${name}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
