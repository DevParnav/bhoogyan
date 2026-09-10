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
    <div className="flex w-full min-h-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0 w-0 overflow-y-auto overflow-x-hidden h-screen p-8">{children}</main>
    </div>
  );
}
