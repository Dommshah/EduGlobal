"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
      router.push("/student");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setBusy(false);
    }
  }

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Okay", "Good", "Strong"][strength];

  return (
    <main className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-gold-300/40 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        {/* Left: pitch */}
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Join EduGlobal</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[1.1] text-ink-900">
            Your journey starts <span className="text-gradient">right here</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-900/60">
            One free account unlocks your personal dashboard: live application tracking, document
            checklists, counselor chat and AI guidance 24/7.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Track every application in real time",
              "Smart document checklist with counselor verification",
              "Direct messaging with your dedicated counselor",
              "EduGuide AI — instant answers about any destination",
            ].map((li) => (
              <li key={li} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">✓</span>
                <span className="text-ink-900/75">{li}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="glass mx-auto w-full max-w-md rounded-3xl p-8 shadow-luxe-lg">
          <h2 className="font-display text-2xl font-bold text-ink-900">Create student account</h2>
          <p className="mt-1 text-sm text-ink-900/50">Free forever. No credit card needed.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Full name</label>
              <input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} className="input-luxe mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Email</label>
              <input required type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input-luxe mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Phone (optional)</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" className="input-luxe mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Password</label>
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="input-luxe mt-1"
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition ${
                          strength >= i
                            ? strength <= 1
                              ? "bg-rose-400"
                              : strength === 2
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            : "bg-ink-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-ink-900/50">{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Confirm password</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                className="input-luxe mt-1"
              />
            </div>

            {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">{error}</p>}

            <button disabled={busy} className="btn-3d w-full !py-3 disabled:opacity-50">
              {busy ? "Creating account…" : "Create my free account 🎓"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-900/55">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
