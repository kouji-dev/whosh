import { PrismaClient } from '@prisma/client';
import { platforms } from '../src/config/platforms';

const prisma = new PrismaClient();

async function main() {
  // Seed platforms
  for (const [code, platform] of Object.entries(platforms)) {
    await prisma.platform.upsert({
      where: { code },
      update: {
        name: platform.name,
        icon: platform.icon,
        color: platform.color
      },
      create: {
        code,
        name: platform.name,
        icon: platform.icon,
        color: platform.color
      }
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 