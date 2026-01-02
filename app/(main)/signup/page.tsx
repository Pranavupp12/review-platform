// app/(main)/signup/page.tsx

import { SignUpForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Sign Up - Help',
  description: 'Create an account to review companies.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {/* CHANGED: Increased max-w to 5xl to fit the split layout */}
      <div className="w-full max-w-5xl">
        <SignUpForm />
      </div>
    </div>
  );
}