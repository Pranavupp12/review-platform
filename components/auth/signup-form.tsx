'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { registerUser } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { SocialButton } from './social-button';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

const useTranslatedPlaceholder = (text: string) => {
    const { targetLang } = useTranslation();
    const [translated, setTranslated] = useState(text);
    useEffect(() => {
        if (targetLang === 'en') { setTranslated(text); return; }
        translateContent(text, targetLang).then(res => { if(res.translation) setTranslated(res.translation) });
    }, [targetLang, text]);
    return translated;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD] h-11 text-base" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TranslatableText text="Create Account" />}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(registerUser, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  React.useEffect(() => {
    if (state?.success) {
      router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [state?.success, router, callbackUrl]);

  // Translated placeholders
  const namePlaceholder = useTranslatedPlaceholder("John Doe");
  const emailPlaceholder = useTranslatedPlaceholder("name@example.com");

  return (
    <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      
      {/* --- LEFT COLUMN: Brand & Visuals --- */}
      <div className="relative hidden md:flex flex-col justify-between bg-[#000032] p-10 text-white">
        <div className="absolute inset-0 opacity-20">
           <Image 
             src="/images/join-com.png"
             alt="Background"
             fill
             className="object-cover"
             priority
           />
        </div>

        <div className="relative z-10">
           <Link href="/" className="text-3xl font-bold tracking-tight text-white">
             help
           </Link>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-2 text-[#0ABED6]">
             <Sparkles className="h-6 w-6" />
             <span className="font-semibold tracking-wide uppercase text-sm">
                 <TranslatableText text="Join the community" />
             </span>
           </div>
           <p className="text-xl font-medium leading-relaxed">
             "<TranslatableText text="Join millions of people sharing their experiences. Your reviews help others make better choices and help companies improve." />"
           </p>
           <div className="pt-4 flex gap-4">
              <div className="h-1 w-12 bg-[#0ABED6] rounded-full" />
              <div className="h-1 w-12 bg-gray-700 rounded-full" />
           </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Sign Up Form --- */}
      <div className="p-8 md:p-12 flex flex-col justify-center h-full">
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
              <TranslatableText text="Create an account" />
          </h1>
          <p className="text-sm text-gray-500">
              <TranslatableText text="Share your experience with the world" />
          </p>
        </div>

        <div className="space-y-6">
          <SocialButton callbackUrl={callbackUrl} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                  <TranslatableText text="Or register with email" />
              </span>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name"><TranslatableText text="Full Name" /></Label>
              <Input id="name" name="name" placeholder={namePlaceholder} required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email"><TranslatableText text="Email" /></Label>
              <Input id="email" name="email" type="email" placeholder={emailPlaceholder} required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password"><TranslatableText text="Password" /></Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className="h-11" />
            </div>

            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                <TranslatableText text={state.error} />
              </div>
            )}

            <SubmitButton />
          </form>

          <div className="text-center text-sm text-gray-500">
            <TranslatableText text="Already have an account?" />{' '}
            <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-[#0ABED6] hover:underline">
              <TranslatableText text="Log in" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}