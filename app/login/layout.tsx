import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login – BhooGyan",
  description: "Sign in to BhooGyan",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen w-full flex items-center justify-center bg-brand-dark text-foreground overflow-hidden">
        {children}
      </body>
    </html>
  );
}
