import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="hero-mesh section-pad grid min-h-[70vh] place-items-center text-center">
      <div className="relative z-10">
        <p className="font-display text-8xl font-bold text-white/90">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">This page studied abroad.</h1>
        <p className="mx-auto mt-3 max-w-md text-white/60">
          The page you&apos;re looking for has emigrated somewhere else. Let&apos;s get you back on the
          journey.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold-3d">
            Back home
          </Link>
          <Link
            href="/universities"
            className="glass-dark rounded-2xl px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Browse universities
          </Link>
        </div>
      </div>
    </main>
  );
}
