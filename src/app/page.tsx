// src/app/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // Signed in = go to dashboard
  if (userId) redirect("/dashboard");

  // Guest landing page
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
            SI
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Smart Inventory Hub</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Asset management, fast.
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200/70 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Track company assets with AI-generated descriptions.
            </h1>

            <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Add an asset, generate a clear technical description using Gemini,
              then manage everything in a fast searchable grid.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Create your account
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>

              {/* Guest can click; middleware will redirect to sign-in */}
              <Link
                href="/dashboard"
                prefetch={false}
                className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
              >
                Go to dashboard →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold">How it works</p>
            <ol className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <li>1) Add an asset (type/name/serial/etc.)</li>
              <li>2) Generate description with Gemini (editable)</li>
              <li>3) Manage in AG Grid (search/sort/filter)</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
