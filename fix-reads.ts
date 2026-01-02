// fix-reads.ts
import { prisma } from './lib/prisma'; // Use your lib instance if possible, or new Client

async function main() {
  console.log('🔧 Forcefully adding "reads" field to MongoDB documents...');

  const reviews = await prisma.review.findMany();
  console.log(`Found ${reviews.length} reviews.`);

  for (const r of reviews) {
    // We update EVERY review, even if it thinks it has a value.
    // This forces MongoDB to materialize the field.
    await prisma.review.update({
      where: { id: r.id },
      data: { 
        // If it has a value, keep it. If not, set to 0.
        reads: r.reads ?? 0 
      }
    });
    process.stdout.write('.'); // Progress dot
  }

  console.log('\n✅ Done! Check MongoDB Compass now.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());