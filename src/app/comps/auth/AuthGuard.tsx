"use client";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Auth removed - this component now just passes children through
export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
