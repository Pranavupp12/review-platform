'use server';

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs"; 
import { revalidatePath } from "next/cache";

// --- CREATE STAFF ---
export async function createStaffAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Missing fields" };

  try {
    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DATA_ENTRY", 
        emailVerified: new Date(), 
      },
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create account. Email likely in use." };
  }
}

// --- EDIT STAFF (New) ---
export async function editStaffAccount(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string; // Optional

  if (!id || !name || !email) return { error: "Missing required fields" };

  try {
    const updateData: any = {
      name,
      email,
    };

    // Only update password if a new one was entered
    if (password && password.trim() !== "") {
      updateData.password = await hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    console.error("Edit Error:", error);
    return { error: "Failed to update account. Email might be in use." };
  }
}

// --- DELETE STAFF ---
export async function deleteStaffAccount(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete account." };
  }
}