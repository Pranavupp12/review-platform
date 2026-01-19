import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const TARGET_COMPANY_ID = "693a5425b2c9d0bd5decf4bb";

  console.log(`🔍 Checking Search & PPC records for Company ID: ${TARGET_COMPANY_ID}...`);

  try {
    // 1. Check how many records exist before deleting
    const count = await prisma.searchQueryStat.count({
      where: {
        companyId: TARGET_COMPANY_ID,
      },
    });

    if (count === 0) {
      console.log("ℹ️ No records found for this company in 'SearchQueryStat'.");
      return;
    }

    console.log(`⚠️ Found ${count} records. Deleting now...`);

    // 2. Perform the deletion
    const result = await prisma.searchQueryStat.deleteMany({
      where: {
        companyId: TARGET_COMPANY_ID,
      },
    });

    console.log(`✅ Success! Deleted ${result.count} records from the Search/PPC table.`);

  } catch (error) {
    console.error("❌ Error during deletion:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });