// src/app/(app)/settings/[[...rest]]/page.tsx
import { UserProfile } from "@clerk/nextjs";

export default async function SettingsCatchAllPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, security, and active sessions.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-1)]">
        <div className="p-3 sm:p-5">
          <UserProfile path="/settings" routing="path" />
        </div>
      </div>
    </div>
  );
}
