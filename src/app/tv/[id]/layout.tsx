"use client";

import { AuthGuard } from "@/app/comps/auth/AuthGuard";

export default function TVLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
