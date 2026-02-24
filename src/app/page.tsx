"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KeyLogin from './comps/auth/KeyLogin';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to main page
    if (!isLoading && isLoggedIn) {
      router.replace('/main');
    }
  }, [isLoggedIn, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-pulse">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Binge<span className="text-[#E50914]">Box</span>
          </h1>
        </div>
      </div>
    );
  }

  // If not logged in, show the login page
  if (!isLoggedIn) {
    return <KeyLogin />;
  }

  // This shouldn't render as we redirect, but just in case
  return null;
}
