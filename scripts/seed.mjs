// Seed a demo user, a sample quote (simulation) and a saved quote version.
// Requires network access to Neon. Run after the schema is applied:
//   node scripts/seed.mjs
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@sisolconstruction.co.uk" },
    update: {},
    create: {
      email: "demo@sisolconstruction.co.uk",
      name: "Demo Client",
      passwordHash,
      role: "CLIENT",
    },
  });

  const simulation = await prisma.simulation.create({
    data: {
      userId: user.id,
      title: "Rear extension, Putney",
      projectType: "EXTENSION",
      description: "Single-storey rear kitchen extension with bi-fold doors.",
      contactName: "Demo Client",
      contactEmail: "demo@sisolconstruction.co.uk",
      contactPhone: "020 7946 0000",
      city: "London",
      postcode: "SW15 1AA",
      areaSqm: 28,
      finishLevel: "STANDARD",
      estimateMin: 61600,
      estimateMax: 96000,
      status: "SUBMITTED",
    },
  });

  await prisma.savedResult.create({
    data: {
      userId: user.id,
      simulationId: simulation.id,
      version: 1,
      label: "Initial ballpark",
      amount: 96000,
      status: "DRAFT",
      breakdown: { works: 84000, prelims: 8400, contingency: 3600 },
    },
  });

  console.log("Seeded demo user demo@sisolconstruction.co.uk / password123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
