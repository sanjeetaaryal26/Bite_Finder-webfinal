import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-white">
      <div className="flex max-w-5xl flex-col gap-10 text-center">
        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium uppercase tracking-wider text-orange-300 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          Bite Finder Access
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Sign in to discover, share, and manage your favorite bites.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-200/80">
            Secure authentication powered by JWT with a clean, focused experience.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-orange-300"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
