import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin_components/admin-sidebar'; // Ensure path is correct

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Check if Logged In
  if (!session?.user) {
    redirect('/admin/login?callbackUrl=/admin');
  }

  // @ts-ignore
  const userRole = session.user.role;

  // 2. ✅ REDIRECT DATA ENTRY STAFF
  if (userRole === 'DATA_ENTRY') {
    redirect('/data-entry');
  }

  // 3. ✅ NEW: REDIRECT BLOG ENTRY STAFF
  if (userRole === 'BLOG_ENTRY') {
    redirect('/blog-entry');
  }

  // 4. ✅ STRICT ADMIN CHECK
  // Only 'ADMIN' is allowed to stay in this layout
  if (userRole !== 'ADMIN') {
    console.log("⛔ ACCESS DENIED: User is not ADMIN. Redirecting...");
    redirect('/dashboard'); // Regular users go back to main site
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="z-50">
         <AdminSidebar 
            userRole="ADMIN" 
            userName={session.user.name || "Admin"} 
         />
      </div>
      <main className="flex-1 ml-[3.5rem] p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}