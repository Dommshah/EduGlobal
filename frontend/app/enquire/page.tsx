"use client";

import { useEffect, useMemo, useState } from "react";
import { api, Country } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const LEVELS = ["Bachelors", "Masters", "PhD", "Diploma"];
const INTAKES = ["Sep 2026", "Jan 2027", "May 2027", "Sep 2027"];

export default function EnquirePage() {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country_interest: "",
    level: "",
    intake: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Country[]>("/countries").then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone || "" }));
  }, [user]);

  const progress = useMemo(() => {
    const fields = [form.name, form.email, form.phone, form.country_interest, form.level, form.intake, form.message];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (user) {
        await api.post("/enquiries", { ...form, source: "dashboard" });
      } else {
        // Guests: file via the public contact channel so CRM still receives it
        await api.post("/contact", {
          name: form.name,
          email: form.email,
          subject: `Enquiry · ${form.country_interest || "General"} · ${form.level || "—"}`,
          message: [
            form.message,
            "",
            `Phone: ${form.phone || "—"}`,
            `Destination: ${form.country_interest || "—"}`,
            `Level: ${form.level || "—"}`,
            `Intake: ${form.intake || "—"}`,
          ].join("\n"),
        });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="section-pad">
        <div className="glass mx-auto max-w-2xl rounded-3xl p-12 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-4xl shadow-3d">✓</span>
          <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">You&apos;re on the list!</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-900/60">
            Your personal counselor will call you within 24 hours with a tailored shortlist. Check your inbox for a confirmation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/" className="btn-3d !px-6 !py-3">Back home</a>
            <a href="/chat" className="rounded-xl border border-ink-100 px-6 py-3 font-semibold text-ink-900 transition hover:bg-ink-50">
              Chat with EduGuide AI
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section-pad">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
        {/* Left: pitch */}
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Free Counselling</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            Your journey begins with <span className="text-gradient">one conversation</span>
          </h1>
          <p className="mt-4 text-ink-900/60">
            Tell us where you want to go. A dedicated counselor builds your personal roadmap — universities,
            scholarships, costs, visas — completely free.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Matched with a counselor for your destination",
              "Balanced shortlist within 48 hours",
              "Scholarship & funding check included",
              "No fees, no spam — cancel anytime",
            ].map((li) => (
              <li key={li} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">✓</span>
                <span className="text-ink-900/75">{li}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-brand-50 px-5 py-4">
            <span className="text-2xl">🛡️</span>
            <p className="text-sm text-brand-900">
              <b>12,000+ students</b> started exactly here — join them.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-900/50">
            <span>Profile completeness</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Full name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Phone / WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 …"
                className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Preferred destination</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {countries.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => set("country_interest", c.name)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      form.country_interest === c.name
                        ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-3d"
                        : "bg-ink-900/5 text-ink-900/70 hover:bg-ink-900/10"
                    }`}
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Study level</label>
                <select
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select…</option>
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Target intake</label>
                <select
                  value={form.intake}
                  onChange={(e) => set("intake", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select…</option>
                  {INTAKES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Anything else? (optional)</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Budget, test scores, dream universities…"
                className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
            <button disabled={busy} className="btn-3d w-full !py-3.5 text-base disabled:opacity-50">
              {busy ? "Submitting…" : user ? "Submit enquiry" : "Get my free counselling 🎓"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
