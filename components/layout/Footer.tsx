// components/layout/footer.tsx

import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0892A5] text-white border-t rounded-t-2xl">
      <div className="container mx-auto max-w-7xl px-4">
        

        {/* --- ROW 1: Link Columns (4 Columns) --- */}
        <div className="py-12 border-b border-white/50 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: About */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-white hover:text-white hover:underline">Help</Link></li>
              <li><Link href="/about" className="text-white hover:text-white hover:underline">About us</Link></li>
              <li><Link href="/contact" className="text-white hover:text-white hover:underline">Contact</Link></li>
              <li><Link href="/blog" className="text-white hover:text-white hover:underline">Blog</Link></li>
              <li><Link href="/how-help-works" className="text-white hover:text-white hover:underline">How Help works</Link></li>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-white hover:text-white hover:underline">Help in reviews</Link></li>
              <li><Link href="/login" className="text-white hover:text-white hover:underline">Log in</Link></li>
              <li><Link href="/signup" className="text-white hover:text-white hover:underline">Sign up</Link></li>
            </ul>
          </div>

          {/* Column 3: Businesses */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Businesses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/business" className="text-white hover:text-white hover:underline">Help Business</Link></li>
              <li><Link href="/business/features" className="text-white hover:text-white hover:underline">Features</Link></li>
              <li><Link href="/plans" className="text-white hover:text-white hover:underline">Plans & Pricing</Link></li>
              <li><Link href="/business/login" className="text-white hover:text-white hover:underline">Business Login</Link></li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Follow us on</h4>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-white hover:text-white transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        {/* --- ROW 3: Bottom Links & Copyright --- */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white">
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <Link href="/legal" className="hover:text-white hover:underline transition-colors">Legal</Link>
            <Link href="/privacy" className="hover:text-white hover:underline transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white hover:underline transition-colors">Terms & Conditions</Link>
            <Link href="/guidelines" className="hover:text-white hover:underline transition-colors">Guidelines for Reviewers</Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p>© 2025 Help. All rights reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}