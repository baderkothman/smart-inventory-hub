import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./ui";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <DashboardClient />;
}
