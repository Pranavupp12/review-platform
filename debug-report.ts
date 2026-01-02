// debug-reports.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 INSPECTING REPORTS DATABASE...");
  
  // Fetch ALL reports without filters
  const reports = await prisma.report.findMany();
  
  console.log(`Found ${reports.length} total reports in the database.\n`);

  reports.forEach((r, i) => {
    console.log(`[Report ${i + 1}]`);
    console.log(`   ID:       ${r.id}`);
    console.log(`   User ID:  ${r.userId}`);
    console.log(`   Archived: ${r.archived}  <-- (Must be explicitly false)`);
    console.log(`   Reason:   ${r.reason}`);
    console.log("------------------------------------------------");
  });
  
  const targetId = "692d6c798f67f8f898895593"; // The ID from your error log
  const match = reports.find(r => r.userId === targetId);
  
  if (match) {
    console.log(`✅ MATCH FOUND! Report ${match.id} belongs to this user.`);
    if (match.archived !== false) {
        console.log(`❌ BUT... 'archived' is ${match.archived}. It needs to be false.`);
    }
  } else {
    console.log(`❌ NO MATCH. No report contains userId: "${targetId}"`);
    console.log("   Compare the IDs above carefully. Is there a typo?");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());