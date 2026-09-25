import Link from "next/link";
import { UniversityCard } from "@/components/cards";
import { CountUp, Reveal } from "@/components/motion";
import { api, University, Country } from "@/lib/api";

export const metadata = { title: "Universities" };

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string; featured?: string };
}) {
  const qs = new URLSearchParams();
  if (searchParams.q) qs.set("q", searchParams.q);
  if (searchParams.country) qs.set("country", searchParams.country);
  if (searchParams.featured) qs.set("featured", searchParams.featured);
  const [unis, countries] = await Promise.all([
    api.get<University[]>(`/universities?${qs.toString()}`).catch(() => []),
    api.get<Country[]>("/countries").catch(() => []),
  ]);
  const countryName = (id: number) => countries.find((c) => c.id === id)?.name ?? "";
  const featuredCount = unis.filter((u) => u.featured).length;

  return (
    <div>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-16 text-white">
        <svg className="pointer-events-none absolute left-6 top-6 h-44 w-44 text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 10 15 30v40l35 20 35-20V30L50 10z" strokeWidth="1" />
          <path d="M50 10v80M15 30l70 40M85 30L15 70" strokeWidth="0.6" />
        </svg>
        <div className="section-pad relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Partner Network</p>
          <h1 className="mt-3 font-display text-5xl font-bold">
            850+ universities. <span className="shimmer-text">One portal.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Official tie-ups mean faster offers, application-fee waivers and exclusive scholarships at every
            campus below.
          </p>
          <form action="/universities" className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search by name or city…"
              className="input-luxe min-w-48 flex-1 !bg-white/95"
            />
            <select name="country" defaultValue={searchParams.country ?? ""} className="input-luxe !w-auto !bg-white/95">
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.slug}>{c.flag} {c.name}</option>
              ))}
            </select>
            <button className="btn-gold-3d !px-6">Search</button>
          </form>
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-4">
            {[
              { v: 41, s: "+", l: "In catalog" },
              { v: 12, s: "", l: "Countries" },
              { v: featuredCount || 17, s: "", l: "Featured" },
            ].map((x) => (
              <div key={x.l} className="glass-dark rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-gold-400">
                  <CountUp value={x.v} suffix={x.s} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-white/55">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-pad py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-900/60">
            {unis.length} universities
            {searchParams.country ? ` in ${countryName(countries.find((c) => c.slug === searchParams.country)?.id ?? 0) || searchParams.country}` : ""}
            {searchParams.q ? ` matching “${searchParams.q}”` : ""}
          </p>
          <div className="flex gap-2">
            <Link
              href="/universities?featured=true"
              className={`chip px-4 py-2 ${searchParams.featured ? "bg-gold-500 text-ink-900" : "bg-white text-ink-900/70 shadow-glass hover:bg-brand-50"}`}
            >
              ★ Featured only
            </Link>
            {(searchParams.q || searchParams.country || searchParams.featured) && (
              <Link href="/universities" className="chip bg-white px-4 py-2 text-ink-900/70 shadow-glass hover:bg-brand-50">
                ✕ Clear filters
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {unis.map((u, i) => (
            <Reveal key={u.id} delay={(i % 3) * 60}>
              <UniversityCard uni={u} countryName={countryName(u.country_id)} />
            </Reveal>
          ))}
        </div>
        {unis.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink-100 p-16 text-center">
            <p className="text-4xl">🏛️</p>
            <p className="mt-3 font-display text-xl font-bold text-ink-900">No universities matched</p>
            <p className="mt-1 text-sm text-ink-900/50">Try a different keyword or clear the filters.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="section-pad pb-12">
        <div className="hero-mesh relative overflow-hidden rounded-[2.5rem] px-8 py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Can&apos;t decide? Let data decide.</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            The AI counselor compares admission odds, costs and post-study outcomes across your shortlist.
          </p>
          <Link href="/chat" className="btn-gold-3d mt-6 inline-flex">Compare with EduGuide 🤖</Link>
        </div>
      </section>
    </div>
  );
}
