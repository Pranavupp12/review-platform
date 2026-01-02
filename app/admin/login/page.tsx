import React from 'react';
// FIX: Import the new specific form
import { AdminLoginForm } from '@/components/admin_components/admin-login-form'; 
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Help',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
         {/* Render the new clean form */}
         <AdminLoginForm />
      </div>
    </div>
  );
}