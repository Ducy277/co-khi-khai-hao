import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function run() {
  const products = await prisma.product.findMany({
    include: { brand: true }
  });
  let updatedCount = 0;
  for (const p of products) {
    if (p.brand && p.brand.name && p.brand.name !== 'Không rõ') {
      const brandName = p.brand.name;
      if (p.name.endsWith(brandName)) {
        const newName = p.name.substring(0, p.name.length - brandName.length).trim();
        await prisma.product.update({
          where: { id: p.id },
          data: { name: newName }
        });
        updatedCount++;
      }
    }
  }
  console.log(`Successfully updated ${updatedCount} product names.`);
}
run().finally(() => prisma.$disconnect());
