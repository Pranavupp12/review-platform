// debug-review.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 DEBUGGING REVIEW DATES...');

  // 1. Fetch one review raw from Prisma
  const review = await prisma.review.findFirst({
    include: { user: true }
  });

  if (!review) {
    console.log('❌ No reviews found in DB.');
    return;
  }

  console.log('------------------------------------------------');
  console.log('1. RAW DB OUTPUT (What Prisma sees):');
  console.log('   ID:', review.id);
  // @ts-ignore
  console.log('   DateOfExp:', review.dateOfExperience);
  // @ts-ignore
  console.log('   CreatedAt:', review.createdAt); 
  console.log('------------------------------------------------');

  if (review.createdAt === undefined) {
    console.log('❌ CRITICAL FAIL: Prisma Client returned undefined for createdAt.');
    console.log('   This means your node_modules are OUT OF SYNC with schema.prisma.');
    console.log('   Run: npx prisma generate');
  } else {
    console.log('✅ SUCCESS: Prisma Client is reading the date correctly.');
    console.log('   If your app still fails, the issue is inside lib/data.ts mapping.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());