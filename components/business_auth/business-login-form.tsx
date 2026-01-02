"use client";

import { useActionState } from 'react'; 
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function BusinessLoginForm() {
  // Use the existing authenticate action
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-black">Login to Help Business</h1>
        <p className="text-gray-600">
          Enter your details to access your business dashboard.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        
        {/* CRITICAL: Redirect to Business Dashboard after login */}
        <input type="hidden" name="redirectTo" value="/business/dashboard" />

        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@company.com" 
            required 
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-[#0ABED6] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-12"
          />
        </div>

        {errorMessage && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 bg-[#000032] hover:bg-[#000032]/90 text-white font-bold text-lg"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
      </div>

      <div className="text-center text-sm text-gray-600">
        Don't have a business account?{' '}
        <Link href="/business/signup?new=true" className="font-bold text-[#0ABED6] hover:underline inline-flex items-center gap-1">
          Claim your free profile <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );
}