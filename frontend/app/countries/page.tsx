import Link from "next/link";
import { CountryCard, SectionHeading } from "@/components/cards";
import { CountUp, Marquee, Reveal, Tilt } from "@/components/motion";
import { api, Country } from "@/lib/api";
import { money } from "@/lib/format";

export const metadata = { title: "Study Destinations" };

export default async function CountriesPage() {
  const countries = await api.get<Country[]>("/countries").catch(() => []);
  return (
    <div>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-16 text-white">
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-float-slow rounded-full bg-brand-500/20 blur-3xl" />
        <div className="section-pad relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Destinations</p>
          <h1 className="mt-3 font-display text-5xl font-bold">
            Choose your corner of <span className="shimmer-text">the world</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            {countries.length} flagship study destinations compared on cost, quality, visas and post-study
            work — distilled from 18 years of placement data.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { v: countries.length, s: "", l: "Destinations" },
              { v: 850, s: "+", l: "Partner campuses" },
              { v: 94, s: "%", l: "Avg. visa success" },
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

      {/* Flag badge marquee */}
      <section className="border-b border-ink-100 bg-white py-6">
        <Marquee speed={44}>
          {countries.map((c) => (
            <span
              key={c.id}
              className="mx-2 flex items-center gap-3 rounded-2xl border border-ink-100 bg-gradient-to-br from-white to-brand-50/70 px-5 py-3 shadow-glass"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl shadow-sm">{c.flag}</span>
              <span className="text-left">
                <b className="block font-display text-sm font-bold text-ink-900">{c.name}</b>
                <span className="block text-[11px] text-ink-900/50">{c.universities_count} partners · {c.visa_success_rate}% visa</span>
              </span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Cards */}
      <section className="section-pad py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 70}>
              <Tilt max={7} className="h-full">
                <CountryCard country={c} />
              </Tilt>
            </Reveal>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Side by Side"
            title="The 60-second comparison"
            sub="Tuition, living costs, visa odds and post-study rights — every destination at a glance."
          />
          <div className="mt-8 overflow-x-auto rounded-3xl border border-ink-100 bg-white shadow-luxe">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-[11px] uppercase tracking-wide text-ink-900/50">
                  <th className="px-5 py-4">Country</th>
                  <th className="px-5 py-4">Tuition from</th>
                  <th className="px-5 py-4">Living/mo</th>
                  <th className="px-5 py-4">Visa rate</th>
                  <th className="px-5 py-4">Intakes</th>
                  <th className="px-5 py-4">Partners</th>
                  <th className="px-5 py-4">Highlights</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr key={c.id} className="border-b border-ink-50 transition last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-4">
                      <span className="text-lg">{c.flag}</span>{" "}
                      <span className="font-bold text-ink-900">{c.name}</span>
                      <p className="mt-0.5 max-w-40 truncate text-xs text-ink-900/45">{c.tagline}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink-900">{money(c.min_tuition)}</td>
                    <td className="px-5 py-4">{money(c.avg_living_cost)}</td>
                    <td className="px-5 py-4">
                      <span className="chip bg-emerald-50 text-emerald-600">{c.visa_success_rate}%</span>
                    </td>
                    <td className="px-5 py-4 text-ink-900/60">{c.intakes}</td>
                    <td className="px-5 py-4 text-ink-900/60">{c.universities_count}</td>
                    <td className="px-5 py-4">
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {(c.highlights ?? []).slice(0, 2).map((h) => (
                          <span key={h} className="chip bg-brand-50 text-[10px] text-brand-700">{h}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/countries/${c.slug}`} className="font-semibold text-brand-600 hover:underline">
                        Explore →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad pb-12">
        <div className="hero-mesh rounded-[2.5rem] px-8 py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Torn between two countries?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            A free counselling session maps your budget and goals to the destination where you&apos;ll thrive most.
          </p>
          <Link href="/enquire" className="btn-gold-3d mt-6 inline-flex">Get My Destination Report</Link>
        </div>
      </section>
    </div>
  );
}
