"use client";

import { useActionState } from 'react'; 
import { setPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(setPasswordAction, null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => router.push('/business/login'), 3000);
    }
  }, [state, router]);

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
           <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-[#000032] mb-2">Password Set!</h3>
        <p className="text-gray-500 mb-6">Your account is active. Redirecting to login...</p>
        <Button onClick={() => router.push('/business/login')} className="bg-[#000032] text-white">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <Input 
             id="password" 
             name="password" 
             type="password" 
             placeholder="Min. 8 characters"
             required 
             minLength={8} 
             className="pl-10 h-12 bg-white"
           />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <Input 
             id="confirm" 
             name="confirm" 
             type="password" 
             placeholder="Re-enter password"
             required 
             minLength={8} 
             className="pl-10 h-12 bg-white"
           />
        </div>
      </div>

      {state?.error && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-100">
           {state.error}
        </p>
      )}

      <Button 
        type="submit" 
        disabled={isPending} 
        className="w-full h-12 bg-[#000032] hover:bg-[#000032]/90 text-white font-bold text-lg"
      >
        {isPending ? <Loader2 className="animate-spin" /> : "Activate Account"}
      </Button>
    </form>
  );
}