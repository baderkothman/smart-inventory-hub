// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardWrapper from "./client-wrapper";

export default async function Page() {
  const { userId } = await auth();

  // Guests must not access authenticated screens.
  // Keep the app flow consistent: after sign-in, land on /home.
  if (!userId) redirect("/sign-in?redirect_url=/home");

  return <DashboardWrapper />;
}
