"use client";

import { AuthGuard } from "@/app/comps/auth/AuthGuard";

export default function LikedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
