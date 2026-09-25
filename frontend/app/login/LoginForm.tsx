"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/api";

const TABS: {
  role: Role;
  label: string;
  icon: string;
  desc: string;
  demo?: { email: string; password: string };
}[] = [
  {
    role: "student",
    label: "Student",
    icon: "🎓",
    desc: "Track applications, documents and your journey timeline.",
    demo: { email: "student@eduglobal.com", password: "Student@123" },
  },
  {
    role: "employee",
    label: "Counselor",
    icon: "🧑‍💼",
    desc: "Manage your CRM pipeline, enquiries and assigned students.",
    demo: { email: "employee@eduglobal.com", password: "Employee@123" },
  },
  {
    role: "admin",
    label: "Admin",
    icon: "🛡️",
    desc: "Full analytics, user management and platform control.",
    demo: { email: "admin@eduglobal.com", password: "Admin@123" },
  },
];

const DASH: Record<Role, string> = { student: "/student", employee: "/employee", admin: "/admin" };

/**
 * Only allow same-origin relative paths as post-login targets.
 * Blocks absolute URLs, protocol-relative (//evil.com) and scheme tricks.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return null;
  return raw;
}

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = TABS.find((t) => t.role === role)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      const next = safeNext(searchParams.get("next"));
      // If the URL asks for a portal the user isn't allowed into, land them at their own dashboard
      const requested =
        next && (DASH[user.role] === next || next.startsWith(`/${user.role}`)) ? next : DASH[user.role];
      router.push(requested);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  function fillDemo(t: (typeof TABS)[number]) {
    setRole(t.role);
    setEmail(t.demo?.email ?? "");
    setPassword(t.demo?.password ?? "");
    setError(null);
  }

  return (
    <div className="glass rounded-3xl p-8 shadow-luxe-lg">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-2xl text-white shadow-3d">
          {active.icon}
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">{active.label} login</h2>
          <p className="text-xs text-ink-900/50">{active.desc}</p>
        </div>
      </div>

      {/* Role tabs */}
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-ink-900/5 p-1">
        {TABS.map((t) => (
          <button
            key={t.role}
            type="button"
            onClick={() => {
              setRole(t.role);
              setError(null);
            }}
            className={`rounded-xl py-2 text-sm font-semibold transition ${
              role === t.role ? "bg-white text-brand-700 shadow-luxe" : "text-ink-900/50 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Email</label>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-luxe mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Password</label>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-luxe mt-1"
          />
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">{error}</p>}

        <button disabled={busy} className="btn-3d w-full !py-3 disabled:opacity-50">
          {busy ? "Signing in…" : `Sign in as ${active.label}`}
        </button>
      </form>

      {active.demo && (
        <button
          onClick={() => fillDemo(active)}
          className="mt-3 w-full rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          ✨ Autofill demo credentials ({active.demo.email})
        </button>
      )}

      <p className="mt-6 text-center text-sm text-ink-900/55">
        New here?{" "}
        <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
          Create a student account
        </Link>
      </p>
    </div>
  );
}
