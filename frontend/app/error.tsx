"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="hero-mesh section-pad grid min-h-[70vh] place-items-center text-center">
      <div className="relative z-10">
        <p className="text-6xl">🛠️</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">Something went sideways.</h1>
        <p className="mx-auto mt-3 max-w-md text-white/60">
          A temporary glitch interrupted this page — our counselors call it &ldquo;character
          building.&rdquo; Try again.
        </p>
        <button onClick={reset} className="btn-gold-3d mt-7">
          Try again
        </button>
      </div>
    </main>
  );
}
