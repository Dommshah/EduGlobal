"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface Msg {
  role: "user" | "assistant";
  content: string;
  suggestions?: { label: string; href: string }[];
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm **EduGuide** 🌍 — your AI study-abroad counselor. Ask me about universities, costs, scholarships, exams or visas, and I'll point you the right way.",
  suggestions: [
    { label: "Cheapest destinations", href: "/countries" },
    { label: "Scholarships", href: "/blog" },
    { label: "Book free counseling", href: "/contact" },
  ],
};

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

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Hide widget on dashboards and the full-page chat
  if (pathname?.startsWith("/student") || pathname?.startsWith("/employee") || pathname?.startsWith("/admin") || pathname === "/chat") {
    return null;
  }

  const send = async () => {
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {        const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
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
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-2xl text-white shadow-luxe-lg transition hover:scale-105"
        aria-label="Open AI counselor"
      >
        {open ? "✕" : "💬"}
        {!open && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-[10px] font-bold text-ink-900">
            AI
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[540px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-luxe-lg">
          <div className="flex items-center gap-3 bg-gradient-to-r from-ink-950 via-brand-900 to-brand-700 px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg">🤖</span>
            <div className="flex-1">
              <p className="text-sm font-bold">EduGuide — AI Counselor</p>
              <p className="flex items-center gap-1 text-[11px] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" /> Online · answers instantly
              </p>
            </div>
            <Link href="/chat" className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold hover:bg-white/20">
              Full page ↗
            </Link>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/60 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-brand-600 text-white"
                        : "rounded-bl-sm border border-ink-100 bg-white prose-chat"
                    }`}
                    dangerouslySetInnerHTML={renderMd(m.content)}
                  />
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <Link
                          key={s.href + s.label}
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className="chip bg-brand-50 text-brand-700 transition hover:bg-brand-100"
                        >
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
                <div className="rounded-2xl rounded-bl-sm border border-ink-100 bg-white px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-400"
                        style={{ animationDelay: `${d * 0.18}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-ink-100 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about unis, visas, scholarships…"
                className="input-luxe !py-2.5"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="btn-3d !px-4 !py-2.5 text-sm disabled:opacity-50"
                aria-label="Send"
              >
                ➤
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-ink-900/40">
              AI guidance — final admissions confirmed by human counselors
            </p>
          </div>
        </div>
      )}
    </>
  );
}
