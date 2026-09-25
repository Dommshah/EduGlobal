"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { Role } from "@/lib/api";

export interface DashTab {
  id: string;
  label: string;
  icon: string;
}

/**
 * Shared layout for /student /employee /admin dashboards.
 * Guards: correct role, else redirect; unauthenticated → /login.
 */
export default function DashShell({
  role,
  title,
  subtitle,
  tabs,
  active,
  onTab,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  tabs: DashTab[];
  active: string;
  onTab: (id: string) => void;
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const allowed = user?.role === role;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=/${role}`);
    } else if (!allowed) {
      // Wrong portal → send them to their own dashboard
      router.replace(user.role === "admin" ? "/admin" : user.role === "employee" ? "/employee" : "/student");
    }
  }, [user, loading, allowed, router, role]);

  if (loading || !user || !allowed) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-ink-900/50">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-3xl p-4">
          {/* Profile */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 text-sm font-bold text-white shadow-3d">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink-900">{user.name}</p>
              <p className="truncate text-xs capitalize text-ink-900/50">{user.role} account</p>
            </div>
          </div>

          {/* Tabs (desktop) */}
          <nav className="mt-4 hidden space-y-1 lg:block">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active === t.id
                    ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-3d"
                    : "text-ink-900/60 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Tabs (mobile: horizontal chips) */}
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  active === t.id
                    ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white"
                    : "bg-ink-900/5 text-ink-900/60"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 border-t border-ink-100 pt-3">
            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-900/60 transition hover:bg-brand-50 hover:text-brand-700"
            >
              <span>🏠</span> Back to site
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
            >
              <span>🚪</span> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-900/55">{subtitle}</p>}
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 text-sm font-bold text-white shadow-3d"
              aria-label="Account menu"
            >
              {initials(user.name)}
            </button>
            {menuOpen && (
              <div className="glass absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl p-2 text-sm">
                <div className="px-3 py-2">
                  <p className="font-bold text-ink-900">{user.name}</p>
                  <p className="truncate text-xs text-ink-900/50">{user.email}</p>
                </div>
                <Link href="/" className="block rounded-xl px-3 py-2 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>
                  🏠 Visit site
                </Link>
                <button
                  onClick={logout}
                  className="block w-full rounded-xl px-3 py-2 text-left text-rose-500 hover:bg-rose-50"
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
