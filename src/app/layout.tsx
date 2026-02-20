// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Inventory Hub",
  description: "Manage company assets with AI-generated descriptions.",
};

const themeInitScript = `
(function () {
  try {
    var key = "sih-theme";
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var useDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
      afterSignOutUrl="/"
      appearance={{
        theme: shadcn,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
