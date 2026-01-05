import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin_components/admin-sidebar';

export default async function DataEntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Check Login
  if (!session?.user) {
    return redirect('/admin/login');
  }

  // 2. Strict Role Check: Only DATA_ENTRY allowed here
  // @ts-ignore
  if (session.user.role !== 'DATA_ENTRY') {
    // If they are Admin, send them to Admin. If User, send to main dash.
    // @ts-ignore
    return redirect(session.user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="z-50">
         {/* Sidebar will automatically filter links based on this role */}
         <AdminSidebar 
            userRole="DATA_ENTRY" 
            userName={session.user.name || "Staff Member"} 
         />
      </div>
      <main className="flex-1 ml-[3.5rem] p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}