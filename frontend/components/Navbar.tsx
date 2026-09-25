"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";

const NAV = [
  { label: "Home", href: "/" },
  {
    label: "Destinations",
    children: [
      { label: "Study Destinations", href: "/countries", desc: "12 flagship countries compared" },
      { label: "Universities", href: "/universities", desc: "850+ partner universities" },
      { label: "Courses", href: "/courses", desc: "Search by level & intake" },
    ],
  },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  {
    label: "More",
    children: [
      { label: "Success Stories", href: "/testimonials", desc: "Real admits, real students" },
      { label: "Blog & Guides", href: "/blog", desc: "Applications, visas, exams" },
      { label: "AI Counselor", href: "/chat", desc: "Ask EduGuide anything" },
      { label: "Support", href: "/support", desc: "Tickets & live help" },
      { label: "FAQs", href: "/faq", desc: "Quick answers" },
    ],
  },
];

function NavDropdown({ item }: { item: (typeof NAV)[number] }) {
  const [open, setOpen] = useState(false);
  if (!("children" in item) || !item.children) {
    return (
      <Link
        href={item.href}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-900/80 transition hover:text-brand-600"
      >
        {item.label}
      </Link>
    );
  }
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink-900/80 transition hover:text-brand-600">
        {item.label}
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2">
          <div className="glass overflow-hidden rounded-2xl p-2">
            {item.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 transition hover:bg-brand-50"
              >
                <p className="text-sm font-semibold text-ink-900">{c.label}</p>
                <p className="text-xs text-ink-900/55">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dash =
    user?.role === "admin" ? "/admin" : user?.role === "employee" ? "/employee" : "/student";

  return (
    <header className="glass sticky top-0 z-40 shadow-glass">
      <nav className="section-pad flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-base font-bold text-white shadow-3d">
            E
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink-900">
            Edu<span className="text-gradient-gold">global</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavDropdown key={item.label} item={item} />
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-40 animate-pulse-soft rounded-xl bg-ink-100" />
          ) : user ? (
            <>
              <Link href={dash} className="btn-3d !px-4 !py-2 text-sm">
                My Dashboard
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900/5 text-sm font-bold text-ink-900 transition hover:bg-ink-900/10"
              >
                {initials(user.name)}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-900/80 transition hover:text-brand-600">
                Login
              </Link>
              <Link href="/enquire" className="btn-3d !px-4 !py-2 text-sm">
                Free Counselling
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/5 text-ink-900 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white/95 px-4 pb-4 pt-2 backdrop-blur-xl lg:hidden">
          {NAV.map((item) => (
            <div key={item.label} className="py-1">
              {"children" in item && item.children ? (
                <>
                  <p className="px-2 pt-2 text-xs font-bold uppercase tracking-wide text-ink-900/40">{item.label}</p>
                  {item.children.map((c) => (
                    <Link key={c.href} href={c.href} className="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-brand-50">
                      {c.label}
                    </Link>
                  ))}
                </>
              ) : (
                <Link href={item.href} className="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-brand-50">
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            {user ? (
              <>
                <Link href={dash} className="btn-3d flex-1 !py-2 text-sm">Dashboard</Link>
                <button onClick={logout} className="rounded-xl border border-ink-100 px-4 py-2 text-sm font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex-1 rounded-xl border border-ink-100 px-4 py-2 text-center text-sm font-semibold">
                  Login
                </Link>
                <Link href="/enquire" className="btn-3d flex-1 !py-2 text-sm">Free Counselling</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
