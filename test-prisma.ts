import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      attributeValues: {
        some: {
          value: { in: ["Nhật Bản", "Thụy Điển"] }
        }
      }
    },
    include: {
      attributeValues: true
    }
  });
  console.log("Found products:", products.length);
  products.forEach(p => console.log(p.name, p.attributeValues.map(v => v.value)));
}
main().catch(console.error).finally(() => prisma.$disconnect());
