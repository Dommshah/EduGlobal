"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, getAuthToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Msg {
  role: "user" | "assistant";
  content: string;
  suggestions?: { label: string; href: string }[];
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm **EduGuide** 🌍 — your AI study-abroad counselor, available 24/7.\n\nAsk me anything: which country fits your budget, which universities match your profile, visa rules, scholarships, intakes… I'll give you data-backed answers and point you to the right pages.",
  suggestions: [
    { label: "Cheapest destinations", href: "/countries" },
    { label: "Top universities", href: "/universities" },
    { label: "Book free counseling", href: "/enquire" },
  ],
};

const STARTERS = [
  "Which country is best for a Masters in CS with a £25k budget?",
  "How does the UK student visa process work in 2026?",
  "Can I get admission without IELTS?",
  "What scholarships are available for engineering?",
  "Compare studying in Canada vs Australia for PR chances",
];

function renderMd(text: string) {
  // Escape ALL HTML first, then inject our own safe markup (bold, line breaks).
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return { __html: html };
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(
    typeof window !== "undefined" ? localStorage.getItem("eduglobal_chat_sid") || Math.random().toString(36).slice(2) : "anon"
  );

  useEffect(() => {
    try {
      localStorage.setItem("eduglobal_chat_sid", sessionId.current);
    } catch {}
  }, []);

  // Restore history for logged-in users
  useEffect(() => {
    if (!user || !getAuthToken()) return;
    api
      .get<{ role: string; content: string }[]>("/chat/history")
      .then((history) => {
        if (history.length > 0) {
          setMessages([
            GREETING,
            ...history.slice(-20).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          ]);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || busy) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", content: message }]);
      setBusy(true);
      try {
        const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
        const res = await api.post<{ reply: string; suggestions: { label: string; href: string }[] }>("/chat", {
          message,
          history,
          session_id: sessionId.current,
        });
        setMessages((m) => [...m, { role: "assistant", content: res.reply, suggestions: res.suggestions }]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "I'm having trouble connecting right now — please try again in a moment. 🛠️" },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [input, busy, messages]
  );

  return (
    <main className="section-pad">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat column */}
        <div className="glass flex h-[calc(100vh-11rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-ink-950 via-brand-900 to-brand-700 px-6 py-4 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-2xl">🤖</span>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">EduGuide — AI Counselor</p>
              <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Online · {user ? `history saved for ${user.name}` : "instant answers, no login needed"}
              </p>
            </div>
            {!user && (
              <Link href="/login" className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
                Log in to save history
              </Link>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ink-50/60 p-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-bl-sm border border-ink-100 bg-white prose-chat"
                    }`}
                    dangerouslySetInnerHTML={renderMd(m.content)}
                  />
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <Link key={s.href + s.label} href={s.href} className="chip bg-brand-50 text-brand-700 transition hover:bg-brand-100">
                          {s.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-ink-100 bg-white px-5 py-4">
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-400" style={{ animationDelay: `${d * 0.18}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-ink-100 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about universities, visas, scholarships, costs…"
                className="input-luxe"
              />
              <button onClick={() => send()} disabled={busy || !input.trim()} className="btn-3d !px-5 disabled:opacity-50" aria-label="Send">
                ➤
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-ink-900/40">
              AI guidance — final admissions are always confirmed by human counselors
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden space-y-4 lg:block">
          <div className="glass rounded-3xl p-5">
            <h3 className="font-display text-base font-bold text-ink-900">Try asking</h3>
            <div className="mt-3 space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={busy}
                  className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 text-left text-xs leading-relaxed text-ink-900/70 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-dark rounded-3xl p-5 text-white">
            <h3 className="font-display text-base font-bold">Want a human?</h3>
            <p className="mt-1 text-xs text-white/70">
              Book a free 1:1 session with a senior counselor for your destination.
            </p>
            <Link href="/enquire" className="btn-3d mt-3 block !py-2.5 text-center text-sm">
              Book free counselling
            </Link>
          </div>
          <div className="glass rounded-3xl p-5 text-xs text-ink-900/60">
            <p className="font-bold text-ink-900">💡 Tip</p>
            <p className="mt-1">
              Mention your budget, academics and target intake — the more context you give, the sharper the shortlist.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
