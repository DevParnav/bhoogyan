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
  return <>{children}</>;
}
