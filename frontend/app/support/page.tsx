"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/cards";
import { api, Ticket, User } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async (u: User) => {
    try {
      setTickets(await api.get<Ticket[]>("/tickets"));
    } catch {
      /* token expired */
    }
  }, []);

  useEffect(() => {
    if (user) loadTickets(user);
  }, [user, loadTickets]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/tickets", { subject, message, priority });
      setSubject("");
      setMessage("");
      setPriority("normal");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
      if (user) setTickets(await api.get<Ticket[]>("/tickets"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="section-pad">
      <SectionHeading
        eyebrow="Student Support"
        title="We're here, whenever you need us"
        sub="Raise a ticket for anything from documents to visa worries — average first response under 2 hours."
      />

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
        {[
          { icon: "🤖", title: "AI Counselor", desc: "Instant answers 24/7 about universities, costs & visas.", href: "/chat", cta: "Start chatting" },
          { icon: "📖", title: "Knowledge Base", desc: "Guides, FAQs and country playbooks written by counselors.", href: "/faq", cta: "Browse FAQs" },
          { icon: "✉️", title: "Email Desk", desc: "support@eduglobal.example · replies within one business day.", href: "/contact", cta: "Write to us" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="card-3d glass rounded-3xl p-6">
            <span className="text-3xl">{c.icon}</span>
            <h3 className="mt-3 font-display text-lg font-bold text-ink-900">{c.title}</h3>
            <p className="mt-1 text-sm text-ink-900/60">{c.desc}</p>
            <p className="mt-3 text-sm font-semibold text-brand-600">{c.cta} →</p>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-2">
        {/* Ticket form */}
        <div className="glass rounded-3xl p-8">
          <h3 className="font-display text-xl font-bold text-ink-900">Raise a support ticket</h3>
          {!authLoading && !user && (
            <p className="mt-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <Link href="/login" className="font-bold underline">Log in</Link> to track your tickets in your dashboard — or use the{" "}
              <Link href="/contact" className="font-bold underline">contact form</Link> without an account.
            </p>
          )}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. My IELTS score upload failed"
                className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Describe your issue</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened and what you need…"
                className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Priority</label>
              {["low", "normal", "urgent"].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
                    priority === p ? "bg-brand-600 text-white shadow-3d" : "bg-ink-900/5 text-ink-900/60 hover:bg-ink-900/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {error && <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
            {done && <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Ticket received — our team is on it!</p>}
            <button disabled={busy} className="btn-3d w-full !py-3 disabled:opacity-50">
              {busy ? "Sending…" : "Submit ticket"}
            </button>
          </form>
        </div>

        {/* My tickets */}
        <div className="glass rounded-3xl p-8">
          <h3 className="font-display text-xl font-bold text-ink-900">My tickets</h3>
          {authLoading ? (
            <div className="mt-4 space-y-3">{[0, 1].map((i) => <div key={i} className="h-16 animate-pulse-soft rounded-xl bg-ink-100" />)}</div>
          ) : user ? (
            tickets.length === 0 ? (
              <p className="mt-4 rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-900/50">
                No tickets yet. Anything you raise will appear here with live status.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {tickets.map((t) => (
                  <li key={t.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-ink-900">{t.subject}</p>
                      <span className={`chip ${STATUS_STYLES[t.status] ?? "bg-ink-50 text-ink-900/60"}`}>{t.status}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-900/55">{t.message}</p>
                    {t.response && (
                      <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
                        <b>Support:</b> {t.response}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="mt-4 rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-900/50">
              Log in to see your ticket history.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
