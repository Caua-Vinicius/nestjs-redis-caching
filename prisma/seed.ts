import { faker } from '@faker-js/faker';
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Leaderboard seed (500k Players)...');

  // Clear the database to avoid duplicates
  await prisma.player.deleteMany();
  console.log('Database cleared.');

  const totalPlayers = 500_000;
  const batchSize = 5000;
  let playersBatch = [];

  const start = Date.now();

  for (let i = 0; i < totalPlayers; i++) {
    const nickname = `${faker.internet.username()}_${i}`;
    const level = faker.number.int({ min: 1, max: 100 });

    const baseXp = level * 1000;
    const xp = faker.number.int({ min: baseXp, max: baseXp + 999 });

    playersBatch.push({
      nickname,
      level,
      xp,
      region: faker.helpers.arrayElement(['NA', 'EU', 'SA', 'ASIA', 'OCE']),
    });

    if (playersBatch.length >= batchSize) {
      await prisma.player.createMany({
        data: playersBatch,
        skipDuplicates: true,
      });

      playersBatch = [];

      const progress = ((i + 1) / totalPlayers) * 100;
      process.stdout.write(
        `\r Progress: ${progress.toFixed(1)}% (${i + 1} players)`,
      );
    }
  }

  // Insert any remaining records
  if (playersBatch.length > 0) {
    await prisma.player.createMany({ data: playersBatch });
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n\n Done! 500,000 players created in ${duration}s.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
