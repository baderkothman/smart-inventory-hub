"use client";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./ui"), { ssr: false });

export default function DashboardWrapper() {
  return <DashboardClient />;
}
