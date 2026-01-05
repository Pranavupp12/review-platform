"use client";

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-semibold" 
      disabled={pending}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
    </Button>
  );
}

export function AdminLoginForm() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  
  // Default to /admin. 
  // NOTE: Your Admin Layout will automatically redirect Data Entry staff 
  // to /data-entry if they land on /admin.
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-slate-200">
      
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center mb-4">
           <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
              {/* Shield icon works for both security levels */}
              <ShieldCheck className="h-6 w-6 text-slate-900" />
           </div>
        </div>
        {/* ✅ UPDATED: Generic Title */}
        <h1 className="text-2xl font-bold text-slate-900">Staff Portal</h1>
        <p className="text-sm text-slate-500">Enter your credentials to access the dashboard.</p>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        
        <div className="space-y-2">
          {/* ✅ UPDATED: Generic Label */}
          <Label htmlFor="email" className="text-slate-700">Work Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@company.com" 
            required 
            className="h-11 border-slate-300 focus-visible:ring-slate-900"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-11 border-slate-300 focus-visible:ring-slate-900"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
            <AlertCircle className="h-4 w-4" />
            <p>{errorMessage}</p>
          </div>
        )}

        <LoginButton />
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
           Restricted System. Authorized Access Only.
        </p>
      </div>
    </div>
  );
}