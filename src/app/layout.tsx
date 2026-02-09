// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Inventory Hub",
  description: "Manage company assets with AI-generated descriptions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      afterSignOutUrl="/" // ✅ add this
    >
      <html lang="en">
        <body className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
