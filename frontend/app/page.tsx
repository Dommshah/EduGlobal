import Link from "next/link";
import Globe from "@/components/Globe";
import { SectionHeading, UniversityCard, CountryCard, TestimonialCard, UniBadge } from "@/components/cards";
import { CountUp, Marquee, QuoteCarousel, Reveal, Tilt } from "@/components/motion";
import { api, Stat, University, Country, Testimonial, Quote } from "@/lib/api";

const PROCESS = [
  { icon: "🎯", title: "Free Profile Counselling", desc: "A senior counselor maps your academics, budget and ambitions to the countries where you'll shine." },
  { icon: "🗂️", title: "University & Course Shortlist", desc: "We shortlist 8–10 best-fit programs across 2–3 countries — ambitious, match and safe options." },
  { icon: "✍️", title: "Applications & SOPs", desc: "Essay guidance that has won $25M+ in scholarships, plus document prep and submission tracking." },
  { icon: "✈️", title: "Visa & Pre-departure", desc: "94% visa success rate. Mock interviews, financials, accommodation and a farewell kit for take-off." },
];

const WHY = [
  { icon: "🏆", title: "18 Years of Trust", desc: "Since 2008 we've placed 12,000+ students — many now leading at Google, NHS, BMW and Deloitte." },
  { icon: "🌐", title: "850+ Partner Universities", desc: "Official tie-ups across 28 countries mean faster offers, waivers and exclusive scholarships." },
  { icon: "🤖", title: "AI + Human Guidance", desc: "EduGuide answers instantly at 2 AM; your human counselor adds strategy, nuance and care." },
  { icon: "📊", title: "Live Application Portal", desc: "Track every document, status and deadline in your personal dashboard — no anxiety, no guesswork." },
];

const WHY_ABROAD = [
  { icon: "🚀", title: "Career Acceleration", desc: "Graduates with international degrees earn 20–30% more on average and stand out in global job markets.", gradient: "from-sky-500 to-blue-700" },
  { icon: "🌍", title: "A Global Network", desc: "Friends, professors and alumni across continents become your lifelong professional network.", gradient: "from-indigo-500 to-purple-700" },
  { icon: "🗣️", title: "Fluency & Confidence", desc: "Immersion builds language mastery and the cross-cultural fluency employers actively seek.", gradient: "from-emerald-500 to-teal-700" },
  { icon: "🔬", title: "World-Class Research", desc: "Access Nobel-winning labs, industry-funded centers and professors shaping your field.", gradient: "from-rose-500 to-pink-700" },
  { icon: "🛂", title: "PR & Work Pathways", desc: "Post-study work visas of 1–4 years open clear routes to residency in top destinations.", gradient: "from-amber-500 to-orange-700" },
  { icon: "🌱", title: "Personal Growth", desc: "Living independently abroad builds resilience, adaptability and a worldview no classroom can teach.", gradient: "from-violet-500 to-fuchsia-700" },
];

const MARQUEE_UNIS = [
  "Oxford", "MIT", "Stanford", "NUS", "Toronto", "Imperial", "Melbourne", "TU Munich",
  "KTH Stockholm", "Sorbonne", "UBC", "Edinburgh", "Waterloo", "Delft", "Trinity Dublin", "Sydney",
];

export default async function HomePage() {
  const [stats, featuredUnis, countries, testimonials, quotes] = await Promise.all([
    api.get<Stat[]>("/stats").catch(() => []),
    api.get<University[]>("/universities?featured=true").catch(() => []),
    api.get<Country[]>("/countries").catch(() => []),
    api.get<Testimonial[]>("/testimonials").catch(() => []),
    api.get<Quote[]>("/quotes").catch(() => []),
  ]);

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="hero-mesh relative overflow-hidden">
        <div className="section-pad relative z-10 grid items-center gap-10 pb-20 pt-16 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          <div>
            <div className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white/85">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-400" />
              850+ partner universities · 28 countries · Sept 2027 intake open
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl">
              Your Dream University,
              <br />
              <span className="shimmer-text">Anywhere on Earth.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
              Eduglobal pairs 18 years of admissions mastery with an AI counselor that never sleeps — so your
              journey from &ldquo;what if?&rdquo; to offer letter feels effortless.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/enquire" className="btn-gold-3d text-base">
                Get Free Counselling 🎓
              </Link>
              <Link
                href="/universities"
                className="glass-dark inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Explore 850+ Universities
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {stats.slice(0, 3).map((s) => (
                <div key={s.id} className="glass-dark rounded-2xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-gold-400">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-white/55">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[540px]">
            <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-3xl" />
            <Globe className="relative h-full w-full" />
          </div>
        </div>
        {/* Floating chips */}
        <div className="pointer-events-none absolute left-[6%] top-[22%] hidden animate-float xl:block">
          <div className="glass-dark rounded-2xl px-4 py-2.5 text-sm text-white">🎓 Oxford · Admit</div>
        </div>
        <div className="pointer-events-none absolute right-[4%] top-[62%] hidden animate-float-slow xl:block">
          <div className="glass-dark rounded-2xl px-4 py-2.5 text-sm text-white">✈️ Visa approved · Toronto</div>
        </div>
        <div className="pointer-events-none absolute bottom-[10%] left-[12%] hidden animate-float-slow xl:block">
          <div className="glass-dark rounded-2xl px-4 py-2.5 text-sm text-white">🏆 $25M scholarships won</div>
        </div>
      </section>

      {/* ---------------- STATS MARQUEE ---------------- */}
      <section className="border-b border-ink-100 bg-white py-5">
        <Marquee speed={36}>
          {stats.map((s) => {
            const icons = [
              <path key="u" d="M12 3L2 8l10 5 10-5-10-5zM6 10.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />, // university
              <path key="c" d="M12 14a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0" />, // graduate cap person
              <path key="v" d="M9 12l2 2 4-5m7 3a9 9 0 11-18 0 9 9 0 0118 0z" />, // visa check
              <path key="g" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c3 3 3 17 0 20M2 12h20" />, // globe
              <path key="s" d="M12 6v6l4 2M12 2a10 10 0 100 20 10 10 0 000-20z" />, // years clock
              <path key="t" d="M12 8v8m-4-4h8M12 2l9 5-9 5-9-5 9-5zm0 10v6" />, // trophy/scholar
            ];
            const icon = icons[(s.id - 1) % icons.length];
            return (
              <span
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-gradient-to-br from-white to-brand-50/60 px-5 py-3 shadow-glass"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-brand-600">
                  {icon}
                </svg>
                <b className="font-display text-xl text-brand-700">{s.value}{s.suffix}</b>
                <span className="text-sm font-semibold text-ink-900/70">{s.label}</span>
              </span>
            );
          })}
        </Marquee>
      </section>

      {/* ---------------- EDUCATION QUOTES ---------------- */}
      <section className="section-pad pb-4 pt-16">
        <Reveal>
          <QuoteCarousel
            quotes={quotes.map((q) => ({ text: q.text, author: q.author }))}
          />
        </Reveal>
      </section>

      {/* ---------------- WHY STUDY ABROAD ---------------- */}
      <section className="section-pad py-16">
        <SectionHeading
          eyebrow="Why Study Abroad?"
          title="An education that changes everything"
          sub="Beyond the degree — what a global education actually does for your career, mind and future."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_ABROAD.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <Tilt className="h-full">
                <div className="card-3d h-full rounded-3xl bg-white p-6 shadow-glass">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${w.gradient} text-2xl text-white shadow-3d`}>
                    {w.icon}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{w.desc}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- DESTINATIONS ---------------- */}
      <section className="bg-dotted section-pad py-16">
        <SectionHeading
          eyebrow="Study Destinations"
          title="Where will the world take you?"
          sub="Twelve flagship destinations, hand-picked for quality, value and post-study opportunity."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {countries.slice(0, 12).map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 70}>
              <Tilt max={7} className="h-full">
                <CountryCard country={c} />
              </Tilt>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/countries" className="btn-3d">
            Compare all destinations →
          </Link>
        </div>
      </section>

      {/* ---------------- UNIVERSITY WORDMARK MARQUEE ---------------- */}
      <section className="border-y border-ink-100 bg-gradient-to-r from-brand-50/60 via-white to-brand-50/60 py-8">
        <Marquee speed={40} reverse>
          {MARQUEE_UNIS.map((u) => (
            <span
              key={u}
              className="mx-2 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-3 shadow-sm transition hover:shadow-luxe"
            >
              <UniBadge name={u} size="h-10 w-10" text="text-sm" />
              <span className="font-display text-lg font-bold text-ink-900/80">{u}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-gold-500">
                <path d="M12 3L2 8l10 5 10-5-10-5zM6 10.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
              </svg>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ---------------- FEATURED UNIVERSITIES ---------------- */}
      <section className="bg-gradient-to-b from-white to-brand-50/40 py-20">
        <div className="section-pad">
          <SectionHeading
            eyebrow="Partner Spotlight"
            title="Universities our students love"
            sub="A glimpse of the 850+ institutions that open their doors to Eduglobal students."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredUnis.slice(0, 6).map((u, i) => (
              <Reveal key={u.id} delay={i * 60}>
                <UniversityCard uni={u} countryName={countries.find((c) => c.id === u.country_id)?.name} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/universities" className="btn-3d">
              Browse all universities →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section className="bg-dotted section-pad py-20">
        <SectionHeading eyebrow="How It Works" title="From first call to first day on campus" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="card-3d relative rounded-3xl bg-white p-6 shadow-glass">
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1 text-xs font-bold text-white shadow-3d">
                  STEP {i + 1}
                </span>
                <span className="text-3xl">{p.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- WHY US ---------------- */}
      <section className="bg-ink-950 py-20 text-white">
        <div className="section-pad">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Why Eduglobal</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Luxury service. <span className="text-gradient-gold">Real results.</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <div className="glass-dark h-full rounded-3xl p-6 transition hover:bg-white/10">
                  <span className="text-3xl">{w.icon}</span>
                  <h3 className="mt-3 font-display text-lg font-bold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Big animated numbers */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 text-center sm:grid-cols-4">
            {[
              { v: 12000, s: "+", l: "Students placed" },
              { v: 850, s: "+", l: "Partner universities" },
              { v: 94, s: "%", l: "Visa success" },
              { v: 18, s: " yrs", l: "Of excellence" },
            ].map((x) => (
              <div key={x.l}>
                <p className="font-display text-4xl font-bold text-gold-400">
                  <CountUp value={x.v} suffix={x.s} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="section-pad py-20">
        <SectionHeading
          eyebrow="Success Stories"
          title="12,000 dreams. One trusted portal."
          sub="Real students, real admits, real lives changed."
        />
        {/* Scrolling rows */}
        <div className="mt-10 space-y-4">
          <Marquee speed={46}>
            {testimonials.slice(0, 7).map((t) => (
              <div key={t.id} className="mx-3 flex w-80 shrink-0">
                <TestimonialCard t={t} />
              </div>
            ))}
          </Marquee>
          <Marquee speed={52} reverse>
            {testimonials.slice(4).map((t) => (
              <div key={t.id} className="mx-3 flex w-80 shrink-0">
                <TestimonialCard t={t} />
              </div>
            ))}
          </Marquee>
        </div>
        <div className="mt-8 text-center">
          <Link href="/testimonials" className="font-semibold text-brand-600 hover:text-brand-700">
            Read all success stories →
          </Link>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section-pad pb-4">
        <div className="hero-mesh relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 animate-float rounded-full bg-gold-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-52 w-52 animate-float-slow rounded-full bg-brand-500/30 blur-3xl" />
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Your seat abroad is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Book a free 1:1 session with a senior counselor — profile evaluation, country mapping and a
            personalized roadmap, on us.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/enquire" className="btn-gold-3d text-base">
              Start My Journey
            </Link>
            <Link href="/chat" className="glass-dark rounded-2xl px-6 py-3 font-semibold text-white hover:bg-white/10">
              Ask EduGuide AI 🤖
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
