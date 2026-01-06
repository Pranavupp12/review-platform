'use server';

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs"; 
import { revalidatePath } from "next/cache";

// --- CREATE STAFF ---
export async function createStaffAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string; // ✅ Get role

  // ✅ Validate role is present
  if (!name || !email || !password || !role) {
    return { error: "Missing fields" };
  }

  try {
    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // @ts-ignore: handling enum type safety
        role: role, // ✅ Save the selected role
        emailVerified: new Date(), 
      },
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create account. Email likely in use." };
  }
}

// --- EDIT STAFF ---
// --- EDIT STAFF ---
export async function editStaffAccount(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!id || !name || !email || !role) {
    return { error: "Missing required fields" };
  }

  try {
    // 1. Fetch current user to compare email
    const currentUser = await prisma.user.findUnique({
        where: { id }
    });

    if (!currentUser) return { error: "User not found." };

    // 2. Prepare Update Data
    const updateData: any = {
      name,
      role: role as any, // Cast to your Role enum type if needed
    };

    // 3. Only update email if it changed (Prevents unique constraint error)
    if (email !== currentUser.email) {
        // Check if new email is already taken by someone else
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) return { error: "Email is already in use by another account." };
        
        updateData.email = email;
    }

    // 4. Only update password if provided
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
    return { error: "Failed to update account." };
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