'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Sparkles, Quote, Flag, ThumbsUp} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SocialButton } from './social-button';
import { useSearchParams } from 'next/navigation';
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";
import { useTranslation } from "@/components/shared/translation-context";
import { translateContent } from "@/lib/translation-action";

// Helper hook for placeholders
const useTranslatedPlaceholder = (text: string) => {
    const { targetLang } = useTranslation();
    const [translated, setTranslated] = useState(text);
    useEffect(() => {
        if (targetLang === 'en') { setTranslated(text); return; }
        translateContent(text, targetLang).then(res => { if(res.translation) setTranslated(res.translation) });
    }, [targetLang, text]);
    return translated;
};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-[#0ABED6] hover:bg-[#09A8BD] h-11 text-base" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TranslatableText text="Log In" />}
    </Button>
  );
}

export function LoginForm() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  
  const isRegistered = searchParams.get('registered') === 'true';
  const messageCode = searchParams.get('message');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Translated placeholders
  const emailPlaceholder = useTranslatedPlaceholder("name@example.com");

  return (
    <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      
      {/* --- LEFT COLUMN: Brand & Visuals --- */}
      <div className="relative hidden md:flex flex-col justify-between bg-[#000032] p-10 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
           <Image 
             src="/images/welcome.png"
             alt="Background"
             fill
             className="object-cover"
             priority
           />
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
           <Link href="/" className="text-3xl font-bold tracking-tight text-white">
             help
           </Link>
        </div>

        <div className="relative z-10 space-y-6">
           <Quote className="h-8 w-8 text-[#0ABED6] opacity-80" />
           <p className="text-xl font-medium leading-relaxed">
             "<TranslatableText text="Help is the world's most powerful review platform, free and open to all. Our mission is to bring people and companies together to create ever-improving experiences for everyone." />"
           </p>
           <div className="pt-4">
              <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">
                <TranslatableText text="Trust & Transparency" />
              </p>
           </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Login Form --- */}
      <div className="p-8 md:p-12 flex flex-col justify-center h-full">
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
             <TranslatableText text="Welcome back" />
          </h1>
          <p className="text-sm text-gray-500">
             <TranslatableText text="Log in to manage your reviews" />
          </p>
        </div>

        {/* Messages */}
        {messageCode === 'login_required' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 text-blue-800">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5 text-[#0ABED6]" />
            <div className="text-sm">
              <p className="font-semibold"><TranslatableText text="Just log in quickly!" /></p>
              <p className="opacity-90"><TranslatableText text="You're just one step away from posting your review." /></p>
            </div>
          </div>
        )}
        
        {messageCode === 'vote_required' && (
          <div className="mb-6 p-4 bg-cyan-50 border border-cyan-100 rounded-lg flex items-start gap-3 text-cyan-900">
            <ThumbsUp className="h-5 w-5 shrink-0 mt-0.5 text-[#0ABED6]" />
            <div className="text-sm">
              <p className="font-semibold"><TranslatableText text="Login to vote" /></p>
              <p className="opacity-90"><TranslatableText text="Please log in to mark this review as helpful." /></p>
            </div>
          </div>
        )}

        {messageCode === 'report_required' && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3 text-orange-900">
            <Flag className="h-5 w-5 shrink-0 mt-0.5 text-orange-600" />
            <div className="text-sm">
              <p className="font-semibold"><TranslatableText text="Login required" /></p>
              <p className="opacity-90"><TranslatableText text="We need you to log in to submit a report." /></p>
            </div>
          </div>
        )}

        {isRegistered && (
          <div className="mb-6 p-3 text-sm text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <TranslatableText text="Account created! Please log in." />
          </div>
        )}

        <div className="space-y-6">
          <SocialButton callbackUrl={callbackUrl} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                  <TranslatableText text="Or login with email" />
              </span>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            
            <div className="space-y-2">
              <Label htmlFor="email"><TranslatableText text="Email" /></Label>
              <Input id="email" name="email" type="email" placeholder={emailPlaceholder} required className="h-11" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password"><TranslatableText text="Password" /></Label>
                <Link href="#" className="text-xs text-gray-500 hover:text-[#0ABED6]">
                  <TranslatableText text="Forgot password?" />
                </Link>
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-11" />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p><TranslatableText text={errorMessage} /></p>
              </div>
            )}

            <LoginButton />
          </form>

          <div className="text-center text-sm text-gray-500">
            <TranslatableText text="New to Help?" />{' '}
            <Link href="/signup" className="font-semibold text-[#0ABED6] hover:underline">
              <TranslatableText text="Sign up" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}