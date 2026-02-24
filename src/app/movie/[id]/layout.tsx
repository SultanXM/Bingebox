"use client";

import { AuthGuard } from "@/app/comps/auth/AuthGuard";

export default function MovieLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
