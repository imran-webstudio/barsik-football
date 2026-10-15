import Link from "next/link";

import { loginAdmin } from "~/app/actions/admin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="night-app flex min-h-svh items-center px-4 py-10">
      <form action={loginAdmin} className="turf mx-auto w-full max-w-sm rounded-3xl px-6 py-8 text-foam">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-amber uppercase">
          Squad sheet
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold">Organizer</h1>
        <p className="mt-2 text-sm text-foam/60">
          Phone numbers stay on this side of the password.
        </p>
        <label className="mt-6 block text-sm font-semibold">
          Password
          <input
            name="password"
            type="password"
            required
            autoFocus
            className="mt-1 w-full border-0 border-b-2 border-white/25 bg-transparent py-3 text-lg text-foam outline-none focus:border-amber"
          />
        </label>
        {params.error ? (
          <p className="mt-3 text-sm font-semibold text-flare">
            That password is not correct.
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-5 h-14 w-full rounded-2xl bg-amber font-display text-lg font-extrabold text-ink"
        >
          Open squad sheet
        </button>
        <Link href="/" className="mt-4 block text-center text-sm font-semibold">
          Back to registration
        </Link>
      </form>
    </main>
  );
}
