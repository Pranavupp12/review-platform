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

  // @ts-ignore
  const userRole = session.user.role;

  // 2. ✅ REDIRECT DATA ENTRY STAFF
  // If a data entry user tries to hit /admin, bounce them to their own dashboard
  if (userRole === 'DATA_ENTRY') {
    console.log("🔀 Redirecting Data Entry Staff to correct dashboard...");
    redirect('/data-entry');
  }

  // 3. ✅ STRICT ADMIN CHECK
  // Now, only 'ADMIN' is allowed to stay in this layout
  if (userRole !== 'ADMIN') {
    console.log("⛔ ACCESS DENIED: User is not ADMIN. Redirecting...");
    redirect('/dashboard'); // Regular users go back to main site
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="z-50">
         <AdminSidebar 
            userRole="ADMIN" // We know it's ADMIN because of the check above
            userName={session.user.name || "Admin"} 
         />
      </div>
      <main className="flex-1 ml-[3.5rem] p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}