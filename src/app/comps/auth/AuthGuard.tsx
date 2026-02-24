"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

// This component wraps protected pages and redirects to login if not authenticated
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // Save the attempted URL to redirect back after login
      if (pathname !== '/') {
        sessionStorage.setItem('redirect_after_login', pathname);
      }
      // Redirect to login page
      router.replace('/');
    }
  }, [isLoggedIn, isLoading, router, pathname]);

  // While loading or not logged in, render children anyway but they'll be redirected
  // This prevents the flash of loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        {/* Transparent placeholder - no visible loading state */}
        {children}
      </div>
    );
  }

  // Not logged in - don't render children to prevent flash
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#141414]" />
    );
  }

  return <>{children}</>;
}
