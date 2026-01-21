"use client";

import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
} from 'lucide-react';
import { LanguageSelector } from "@/components/shared/language-selector"; 
import { TranslatableText } from "@/components/shared/translatable-text"; 

export function Footer() {
  return (
    <footer className="bg-[#0892A5] text-white mt-20">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        
        {/* --- ROW 1: Link Columns --- */}
        <div className="py-16 border-b border-white/20 grid grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Column 1: About */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-blue-100">
              <TranslatableText text="About" />
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              <li><Link href="/" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Help" /></Link></li>
              <li><Link href="/about" className="hover:text-white hover:underline transition-colors"><TranslatableText text="About us" /></Link></li>
              <li><Link href="/contact" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Contact" /></Link></li>
              <li><Link href="/blog" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Blog" /></Link></li>
              <li><Link href="/how-help-works" className="hover:text-white hover:underline transition-colors"><TranslatableText text="How Help works" /></Link></li>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-blue-100">
               <TranslatableText text="Community" />
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              <li><Link href="/help" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Help in reviews" /></Link></li>
              <li><Link href="/login" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Log in" /></Link></li>
              <li><Link href="/signup" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Sign up" /></Link></li>
            </ul>
          </div>

          {/* Column 3: Businesses */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-blue-100">
               <TranslatableText text="Businesses" />
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              <li><Link href="/business" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Help Business" /></Link></li>
              <li><Link href="/business/features" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Features" /></Link></li>
              <li><Link href="/business/plans" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Plans & Pricing" /></Link></li>
              <li><Link href="/business/login" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Business Login" /></Link></li>
            </ul>
          </div>

          {/* Column 4: Follow Us (Vertical Stack) */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-blue-100">
               <TranslatableText text="Follow us on" />
            </h4>
            <div className="flex flex-col gap-4">
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <Twitter className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <Youtube className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* --- ROW 2: Language Selector --- */}
        <div className="py-8 border-b border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-blue-100 max-w-md text-center md:text-left leading-relaxed">
                <TranslatableText text="Choose your preferred language to explore Help in a way that feels like home." />
            </div>
            
            {/* ✅ CLEANER LAYOUT: No extra wrapper needed now */}
            <div>
                <LanguageSelector />
            </div>
        </div>

        {/* --- ROW 3: Bottom Links & Copyright --- */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/80">
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 font-medium">
            <Link href="/legal" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Legal" /></Link>
            <Link href="/privacy" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Privacy Policy" /></Link>
            <Link href="/terms" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Terms & Conditions" /></Link>
            <Link href="/guidelines" className="hover:text-white hover:underline transition-colors"><TranslatableText text="Guidelines for Reviewers" /></Link>
          </div>

          <div className="text-center md:text-right opacity-70">
            <p>© 2025 Help. All rights reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}