// app/(main)/dashboard/settings/page.tsx

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SettingsForm } from '@/components/dashboard_components/settings-form';

export const metadata = {
  title: 'Profile Settings - Help',
};

export default async function SettingsPage() {
  const session = await auth();
  
  // 1. Check if session exists
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 2. Fetch fresh user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // 3. CRITICAL FIX: Check if user exists in DB
  // If the database was reset, 'user' will be null. Force logout/redirect.
  if (!user) {
    redirect('/api/auth/signout?callbackUrl=/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <SettingsForm user={user} />
        </div>
      </div>
    </div>
  );
}