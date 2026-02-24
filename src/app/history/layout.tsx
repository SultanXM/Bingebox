"use client";

import { AuthGuard } from "@/app/comps/auth/AuthGuard";

export default function HistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
