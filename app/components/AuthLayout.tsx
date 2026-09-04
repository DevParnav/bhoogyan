"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ["/login", "/signup", "/reset-password"].some((p) => pathname?.startsWith(p));

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto h-screen p-8 min-w-0">{children}</main>
    </div>
  );
}
