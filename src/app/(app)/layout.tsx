// src/app/(app)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppShell from "./_components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth enforcement in E2E test mode (disabled by default in production)
  if (process.env.E2E_TEST_MODE !== "true") {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
