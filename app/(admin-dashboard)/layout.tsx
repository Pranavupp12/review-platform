// app/(admin-dashboard)/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin_components/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // --- DEBUG LOGS ---
  console.log("🛡️ ADMIN LAYOUT CHECK:");
  console.log("   - User:", session?.user?.email);
  // @ts-ignore
  console.log("   - Role:", session?.user?.role);

  // 1. Check if Logged In
  if (!session?.user) {
    redirect('/admin/login?callbackUrl=/admin');
  }

  // 2. Check if Admin
  // @ts-ignore
  if (session.user.role !== 'ADMIN') {
    console.log("⛔ ACCESS DENIED: User is not ADMIN. Redirecting...");
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="z-50">
         <AdminSidebar />
      </div>
      <main className="flex-1 ml-[3.5rem] p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}