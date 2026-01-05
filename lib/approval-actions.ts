'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function processApproval(changeId: string, decision: "APPROVE" | "REJECT", adminNote?: string) {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  const changeRequest = await prisma.pendingChange.findUnique({ where: { id: changeId } });
  if (!changeRequest) return { error: "Request not found" };

  // --- REJECTION LOGIC ---
  if (decision === "REJECT") {
    await prisma.pendingChange.update({
      where: { id: changeId },
      data: { status: "REJECTED", adminNote: adminNote || "No reason provided." }
    });
    revalidatePath("/admin/data-approval");
    return { success: true };
  }

  // --- APPROVAL LOGIC ---
  try {
    let payload = changeRequest.data as any;

    // 🔧 FIX: Restore Date Objects for Company
    if (payload.domainVerified && typeof payload.domainVerified === 'string') {
        payload.domainVerified = new Date(payload.domainVerified);
    }

    // 1. Handle BLOG Changes
    if (changeRequest.model === "BLOG") {
      if (changeRequest.action === "CREATE") {
        await prisma.blog.create({ data: payload });
      } else if (changeRequest.action === "UPDATE" && changeRequest.targetId) {
        await prisma.blog.update({ where: { id: changeRequest.targetId }, data: payload });
      }
    }

    // 2. Handle COMPANY Changes
    else if (changeRequest.model === "COMPANY") {
      delete payload.id; 
      delete payload.createdAt;
      delete payload.updatedAt;

      if (changeRequest.action === "CREATE") {
        await prisma.company.create({ data: payload });
      } else if (changeRequest.action === "UPDATE" && changeRequest.targetId) {
        await prisma.company.update({ where: { id: changeRequest.targetId }, data: payload });
      }
    }

    // 3. Mark as Approved
    await prisma.pendingChange.update({
        where: { id: changeId },
        data: { status: "APPROVED" }
    });

    revalidatePath("/admin/data-approval");
    revalidatePath("/admin/companies");
    revalidatePath("/admin/blogs");
    revalidatePath("/data-entry"); // Updates the staff dashboard status list

    return { success: true };

  } catch (error) {
    console.error("Approval Execution Failed:", error);
    return { error: "Failed to apply changes. Check server logs." };
  }
}