// app/(main)/login/page.tsx

import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Log In - Help',
  description: 'Log in to your account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {/* Allow width to grow for the split layout */}
      <div className="w-full max-w-5xl"> 
        <LoginForm />
      </div>
    </div>
  );
}