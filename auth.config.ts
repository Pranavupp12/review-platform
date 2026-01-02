// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');

      // 1. Protected Routes: Redirect unauthenticated users to login
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      // 2. Auth Routes: Redirect authenticated users
      if (isOnAuth && isLoggedIn) {
        // --- FIX START ---
        // Check if there is a callbackUrl in the query params
        const callbackUrl = nextUrl.searchParams.get('callbackUrl');
        
        if (callbackUrl) {
          // If there is a callbackUrl, redirect there
          return Response.redirect(new URL(callbackUrl, nextUrl));
        }
        
        // Otherwise, default to dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
        // --- FIX END ---
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;