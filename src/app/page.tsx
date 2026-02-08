import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      {/* Header */}
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

      {/* Hero */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Neon + Drizzle • Clerk • Gemini • AG Grid
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Manage laptops, monitors, and licenses —
              <span className="text-zinc-600 dark:text-zinc-300">
                {" "}
                with AI-generated descriptions.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Smart Inventory Hub helps your team track company assets, generate
              clear technical descriptions using Gemini, and manage everything
              in a fast, searchable grid built with AG Grid.
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

              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
              >
                Go to dashboard →
              </Link>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <FeatureStat
                title="Fast grid"
                text="Search, sort, filter instantly."
              />
              <FeatureStat
                title="AI assist"
                text="Generate and edit descriptions."
              />
              <FeatureStat
                title="Audit-ready"
                text="Consistent asset metadata."
              />
            </div>
          </div>

          {/* Right side card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">How it works</p>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  3 steps
                </span>
              </div>

              <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg bg-zinc-950 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Add an asset
                    </p>
                    <p>Type, name, brand, model, serial, and notes.</p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg bg-zinc-950 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Generate description
                    </p>
                    <p>Gemini writes a technical description you can edit.</p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-lg bg-zinc-950 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Manage in grid
                    </p>
                    <p>Instant search/sort + scalable management.</p>
                  </div>
                </li>
              </ol>

              <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  Tip
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  After signing in, head to the dashboard to start adding
                  assets.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href="/sign-up"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Sign up
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Smart Inventory Hub</p>
            <p className="text-xs">
              Built with Next.js • Drizzle • Neon • Clerk • Gemini • AG Grid
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureStat({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{text}</p>
    </div>
  );
}
