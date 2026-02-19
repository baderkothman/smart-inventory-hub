import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left panel */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Smart Inventory Hub
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Sign in
            </h1>

            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Continue to your dashboard to manage assets and keep everything
              scoped to your account.
            </p>

            {/* One primary CTA only */}
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>

              <Button asChild variant="ghost">
                <Link href="/">Back to landing</Link>
              </Button>
            </div>
          </div>

          {/* Clerk surface */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-2)] sm:p-6">
            <SignIn
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none border-0 p-0",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
