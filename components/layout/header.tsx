'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/lib/hooks/use-scroll';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { UserAccountNav } from './user-account-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { NotificationBell } from '@/components/layout/notification-bell';

type NavLink = {
  label: string;
  href: string;
};

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  variant?: 'user' | 'business';
}

export function Header({ user, variant = 'user' }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const scrolled = useScroll(10);

  const isBusiness = variant === 'business';

  const links: NavLink[] = isBusiness 
    ? [
        { label: 'Features', href: '/business/features' },
        { label: 'Plans', href: '/business/plans' },
        { label: 'Resources', href: '/business/resources' },
      ]
    : [
        { label: 'Write a Review', href: '/write-review' },
        { label: 'Categories', href: '/categories' },
        { label: 'Blog', href: '/blog' },
      ];

  const logoHref = isBusiness ? '/business' : '/';
  
  // --- UPDATED LOGO COMPONENT ---
  const Logo = () => (
    <Link
      href={logoHref}
      className="flex items-center gap-2 transition-colors group select-none"
    >
      {isBusiness ? (
        // Stacked Layout for Business
        <div className="flex flex-col items-start justify-center leading-none">
          <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#0ABED6] transition-colors">
            help
          </span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-[1px]">
            business
          </span>
        </div>
      ) : (
        // Standard Layout for User
        <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#0ABED6] transition-colors">
          help
        </span>
      )}
    </Link>
  );
  // ------------------------------

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300', {
        'bg-gray-50 border-gray-200': scrolled, // Added blur for nicer effect
        'bg-gray-50': !scrolled
      })}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        
        <Logo />

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#0ABED6]",
                scrolled ? "text-gray-700" : "text-gray-600"
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell 
                    isOpen={activeDropdown === 'notifications'} 
                    onToggle={(isOpen) => setActiveDropdown(isOpen ? 'notifications' : null)}
                /> 
                <UserAccountNav 
                    user={user} 
                    open={activeDropdown === 'account'}
                    onOpenChange={(isOpen) => setActiveDropdown(isOpen ? 'account' : null)}
                />
              </div>
            ) : (
              <>
                {isBusiness ? (
                  <>
                    <Link href="/business/login">
                      <Button variant="ghost" className="font-semibold text-gray-700">Log in</Button>
                    </Link>
                    <Link href="/business/signup?new=true">
                      <Button className="rounded-full bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white px-6 font-semibold shadow-sm">
                        Create Free Account
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="font-semibold text-gray-700">Log In</Button>
                    </Link>
                    <Link href="/business">
                      <Button className="rounded-full bg-[#0ABED6] hover:bg-[#0ABED6]/80 text-white px-6 font-semibold shadow-sm">
                        Sign in for Business
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-6" duration={300} />
        </Button>
      </nav>

      {/* --- MOBILE MENU CONTENT --- */}
      <MobileMenu open={open}>
        <div className="flex flex-col h-full p-6">

          {user && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-[#0ABED6] text-white font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate w-[200px]">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg font-medium text-gray-600 hover:text-[#0ABED6] transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 text-[#0ABED6]" />
                  My Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  Settings
                </Link>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setOpen(false); }}
                  className="flex items-center gap-2 text-red-600 font-medium p-2 hover:bg-red-50 rounded-md w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {isBusiness ? (
                   <>
                     <Link href="/business/login" onClick={() => setOpen(false)}>
                       <Button variant="outline" className="w-full h-12 text-base hover:bg-gray-200">Log in</Button>
                     </Link>
                     <Link href="/business/signup?new=true" onClick={() => setOpen(false)}>
                       <Button className="w-full h-12 text-base bg-[#0ABED6] hover:bg-[#0ABED6]/90 text-white">
                         Create Free Account
                       </Button>
                     </Link>
                   </>
                ) : (
                   <>
                     <Link href="/login" onClick={() => setOpen(false)}>
                       <Button variant="outline" className="w-full h-12 text-base hover:bg-gray-200">Log In</Button>
                     </Link>
                     <Link href="/business" onClick={() => setOpen(false)}>
                       <Button className="w-full h-12 text-base bg-[#0ABED6] hover:bg-[#0ABED6]/90 text-white">
                         Sign in for Business
                       </Button>
                     </Link>
                   </>
                )}
              </div>
            )}
          </div>
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<'div'> & {
  open: boolean;
};

function MobileMenu({ open, children }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-white fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-y-auto border-t animate-in slide-in-from-top-5 duration-200 md:hidden',
      )}
    >
      {children}
    </div>,
    document.body,
  );
}