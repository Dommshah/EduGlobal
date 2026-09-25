import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to the EduGlobal student, counselor or admin portal.",
};

export default function LoginPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gold-300/40 blur-3xl" />
      </div>

      <div className="section-pad grid min-h-[calc(100vh-4rem)] items-center gap-10 lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Welcome back</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.1] text-ink-900">
            One login for your <span className="text-gradient">whole journey</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-900/60">
            Students track applications. Counselors run their pipeline. Admins command the platform —
            all from one secure door.
          </p>
          <div className="mt-8 max-w-md space-y-3">
            {[
              { icon: "🎓", title: "Student portal", desc: "Applications, documents & journey timeline." },
              { icon: "🧑‍💼", title: "Counselor portal", desc: "CRM pipeline, enquiries & assigned students." },
              { icon: "🛡️", title: "Admin portal", desc: "Platform analytics, users & universities." },
            ].map((t) => (
              <div key={t.title} className="glass flex items-center gap-4 rounded-2xl px-5 py-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-xl text-white shadow-3d">
                  {t.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{t.title}</p>
                  <p className="text-xs text-ink-900/55">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="mx-auto w-full max-w-md">
          <Suspense fallback={<div className="mx-auto h-96 w-full max-w-md animate-pulse-soft rounded-3xl bg-ink-100" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
