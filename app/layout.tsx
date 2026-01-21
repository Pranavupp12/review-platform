// app/layout.tsx
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/sonner";
import { TranslationProvider } from "@/components/shared/translation-context";

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Review Platform',
  description: 'Find and review companies.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen font-sans antialiased',
          noto.variable
        )}
      >
        <TranslationProvider>
        {children}
        <Toaster /> {/* Global Toaster for notifications */}
        </TranslationProvider>
      </body>
    </html>
  );
}