import Link from "next/link";
import { TestimonialCard, SectionHeading } from "@/components/cards";
import { CountUp, Marquee, Reveal } from "@/components/motion";
import { api, Testimonial, Quote } from "@/lib/api";

export const metadata = { title: "Success Stories" };

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { country?: string };
}) {
  const [all, quotes] = await Promise.all([
    api.get<Testimonial[]>("/testimonials").catch(() => []),
    api.get<Quote[]>("/quotes").catch(() => []),
  ]);

  const countries = Array.from(new Set(all.map((t) => t.country).filter(Boolean))) as string[];
  const active = searchParams.country;
  const testimonials = active ? all.filter((t) => t.country === active) : all;
  const featured = all.filter((t) => t.featured);

  return (
    <div>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-16 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-float-slow rounded-full bg-gold-500/15 blur-3xl" />
        <div className="section-pad relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Success Stories</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl font-bold leading-tight">
            Proof, in their <span className="shimmer-text">own words</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Every story below began with a free counselling session. {countries.length} countries.
            Countless offer letters. One promise kept.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { v: 12000, s: "+", l: "Students placed" },
              { v: 25, s: "M+", l: "Scholarships won", p: "$" },
              { v: 94, s: "%", l: "Visa success" },
            ].map((x) => (
              <div key={x.l} className="glass-dark rounded-2xl p-4">
                <p className="font-display text-3xl font-bold text-gold-400">
                  <CountUp value={x.v} suffix={x.s} prefix={x.p} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-white/55">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured marquee */}
      {featured.length > 2 && (
        <section className="border-b border-ink-100 bg-white py-6">
          <Marquee speed={48}>
            {featured.map((t) => (
              <span key={t.id} className="mx-3 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-3 shadow-sm">
                {t.avatar_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar_image} alt={t.name} className={`h-9 w-9 rounded-xl object-cover ring-2 ring-white bg-gradient-to-br ${t.avatar_gradient}`} />
                ) : (
                  <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${t.avatar_gradient} text-xs font-bold text-white`}>
                    {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                )}
                <span className="text-sm">
                  <b className="text-ink-900">{t.name}</b>
                  <span className="text-ink-900/50"> → {t.university}</span>
                </span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gold-500">
                  <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 00.95.69h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 00-.36 1.12l1.28 3.96c.3.92-.75 1.69-1.54 1.12l-3.36-2.44a1 1 0 00-1.18 0l-3.36 2.44c-.79.57-1.84-.2-1.54-1.12l1.28-3.96a1 1 0 00-.36-1.12L2.06 9.39c-.78-.57-.38-1.81.59-1.81h4.16a1 1 0 00.95-.69l1.29-3.96z" />
                </svg>
              </span>
            ))}
          </Marquee>
        </section>
      )}

      {/* Inspiration quote */}
      {quotes.length > 0 && (
        <section className="section-pad pt-14 pb-2">
          <Reveal>
            <figure className="mx-auto max-w-2xl text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-gold-500" fill="currentColor">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>
              <blockquote className="mt-3 font-display text-xl font-medium text-ink-900/80">
                &ldquo;{quotes[0].text}&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                — {quotes[0].author}
              </figcaption>
            </figure>
          </Reveal>
        </section>
      )}

      {/* Filter chips */}
      <section className="section-pad pt-8">
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/testimonials"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !active ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-3d" : "glass text-ink-900/70 hover:text-brand-600"
            }`}
          >
            All countries
          </Link>
          {countries.map((c) => (
            <Link
              key={c}
              href={`/testimonials?country=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === c ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-3d" : "glass text-ink-900/70 hover:text-brand-600"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 80}>
              <TestimonialCard t={t} />
            </Reveal>
          ))}
        </div>
        {testimonials.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink-100 p-16 text-center text-ink-900/50">
            No stories from {active} yet — be the first! ✨
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="section-pad pb-10 pt-4 text-center">
        <div className="hero-mesh relative overflow-hidden rounded-[2.5rem] px-8 py-14">
          <div className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 animate-float rounded-full bg-gold-500/20 blur-2xl" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">The next story could be yours</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Join 12,000+ students who turned ambition into an admit letter with Eduglobal.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/enquire" className="btn-gold-3d">Start My Journey</Link>
            <Link href="/chat" className="glass-dark rounded-2xl px-6 py-3 font-semibold text-white hover:bg-white/10">
              Ask EduGuide AI 🤖
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
