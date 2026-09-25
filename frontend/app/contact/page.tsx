"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/cards";
import { api } from "@/lib/api";

const OFFICES = [
  { city: "New Delhi", flag: "🇮🇳", address: "Level 12, Tower B, Cyber Greens, DLF Phase 3", phone: "+91 11 4000 1234", hours: "Mon–Sat · 9:30–18:30 IST" },
  { city: "London", flag: "🇬🇧", address: "18 Soho Square, Fitzrovia", phone: "+44 20 7946 0810", hours: "Mon–Fri · 9:00–17:30 GMT" },
  { city: "Sydney", flag: "🇦🇺", address: "Suite 4, 55 York Street, CBD", phone: "+61 2 8000 4567", hours: "Mon–Fri · 9:00–17:00 AEST" },
  { city: "Toronto", flag: "🇨🇦", address: "2300 Yonge Street, Suite 1600", phone: "+1 416 555 0192", hours: "Mon–Fri · 10:00–18:00 EST" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/contact", form);
      setDone(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="section-pad">
      <SectionHeading
        eyebrow="Contact Us"
        title="Let's plan your journey together"
        sub="Walk into any of our global offices, call us, or drop a message — a senior counselor replies to every message personally."
      />

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Form */}
        <div className="glass rounded-3xl p-8">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">✓</span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink-900">Message received!</h3>
              <p className="mt-2 max-w-sm text-sm text-ink-900/60">
                A senior counselor will reach out within one business day. Meanwhile, our AI counselor is online 24/7.
              </p>
              <button onClick={() => setDone(false)} className="btn-3d mt-6 !px-6 !py-2.5 text-sm">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="font-display text-xl font-bold text-ink-900">Send us a message</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Full name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Email</label>
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
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  placeholder="e.g. Question about January intake"
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="How can we help?"
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {error && <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
              <button disabled={busy} className="btn-3d w-full !py-3 disabled:opacity-50">
                {busy ? "Sending…" : "Send message"}
              </button>
              <p className="text-center text-xs text-ink-900/40">
                By submitting you agree to our privacy policy. We never share your details.
              </p>
            </form>
          )}
        </div>

        {/* Offices */}
        <div className="space-y-4">
          {OFFICES.map((o) => (
            <div key={o.city} className="card-3d glass flex items-start gap-4 rounded-3xl p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl">{o.flag}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">{o.city}</h3>
                <p className="text-sm text-ink-900/60">{o.address}</p>
                <p className="mt-1 text-sm font-semibold text-brand-700">{o.phone}</p>
                <p className="text-xs text-ink-900/45">{o.hours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
