import Link from "next/link";
import { SectionHeading } from "@/components/cards";

const VALUES = [
  { icon: "🧭", title: "Student First, Always", desc: "Every recommendation is driven by your future — never by commissions. Our counselors are salaried advisors, not sales agents." },
  { icon: "💎", title: "Craft & Care", desc: "From your first call to your airport farewell, every touchpoint is designed to feel personal, warm and premium." },
  { icon: "🔓", title: "Radical Transparency", desc: "Live dashboards, honest timelines and no hidden fees. You see exactly what we see." },
  { icon: "🌍", title: "Global Citizens", desc: "Our team studied, worked and immigrated across 12 countries — we've sat where you're sitting." },
];

const TEAM = [
  { name: "Aisha Rahman", role: "Founder & CEO", grad: "from-brand-500 to-brand-700", bio: "Former admissions officer at a Russell Group university. Founded Eduglobal in 2008 from a single desk in Chennai." },
  { name: "David Okafor", role: "Head of Counselling", grad: "from-emerald-500 to-teal-700", bio: "16 years guiding STEM applicants. Has read more SOPs than most committees — twice." },
  { name: "Mei Tanaka", role: "Director, Partnerships", grad: "from-rose-500 to-pink-700", bio: "Builds and nurtures our 850+ university network across 28 countries, negotiating scholarships for students." },
  { name: "Carlos Mendes", role: "Visa & Compliance Lead", grad: "from-amber-500 to-orange-700", bio: "94% visa success rate doesn't happen by luck. Carlos runs mock interviews harder than consulates do." },
];

const MILESTONES = [
  ["2008", "Founded in Chennai with 3 counselors and 27 students in year one"],
  ["2013", "500th university partnership signed; UK & Canada desks open"],
  ["2017", "10,000th student placed; Berlin & Toronto offices launched"],
  ["2021", "Pandemic pivot: virtual counseling in 14 languages"],
  ["2024", "EduGuide AI counselor launches; CRM portal goes live"],
  ["2026", "$25M in scholarships won by our students to date"],
];

export default function AboutPage() {
  return (
    <div>
      <section className="hero-mesh py-20 text-white">
        <div className="section-pad text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">About Eduglobal</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl font-bold leading-tight">
            We don&apos;t send students abroad.
            <span className="block shimmer-text">We launch global citizens.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/70">
            Since 2008, Eduglobal has been the quiet engine behind 12,000+ international careers — matching
            ambition to opportunity with counsel that&apos;s honest, warm and relentless.
          </p>
        </div>
      </section>

      <section className="section-pad py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              center={false}
              eyebrow="Our Story"
              title="Started with 27 students. Fueled by 12,000 dreams."
            />
            <div className="mt-5 space-y-4 text-ink-900/70">
              <p>
                In 2008, our founder Aisha Rahman — then a university admissions officer — watched brilliant
                students lose their spots to confusion, not capability. Missing deadlines. Misread visa rules.
                Bad advice from agents chasing commissions.
              </p>
              <p>
                She started Eduglobal with a simple rule that still governs every desk:{" "}
                <b className="text-ink-900">advise the student you would advise for free.</b> Eighteen years
                later that rule has produced 12,000+ placements, $25M in scholarships and an alumni network
                that now interviews our applicants.
              </p>
              <p>
                Today we pair that human judgment with EduGuide, our AI counselor, and a live portal where
                students track every document — because luxury means never having to wonder what happens next.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MILESTONES.map(([year, text]) => (
              <div key={year} className="card-3d rounded-3xl bg-white p-5 shadow-glass">
                <p className="font-display text-2xl font-bold text-gradient">{year}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-900/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="section-pad">
          <SectionHeading eyebrow="Values" title="What we refuse to compromise" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card-3d rounded-3xl border border-ink-100 bg-ink-50/50 p-6">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad py-20">
        <SectionHeading eyebrow="Leadership" title="The people behind the placements" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m) => (
            <div key={m.name} className="card-3d overflow-hidden rounded-3xl bg-white shadow-glass">
              <div className={`grid h-40 place-items-center bg-gradient-to-br ${m.grad}`}>
                <span className="font-display text-5xl font-bold text-white/95">
                  {m.name.split(" ").map((p) => p[0]).join("")}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold">{m.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{m.role}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-900/55">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad pb-8">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-8 py-14 text-center text-white shadow-luxe-lg">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Meet your future counselor</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            20 minutes, zero cost, zero obligation — just a clear map of your options.
          </p>
          <Link href="/enquire" className="btn-gold-3d mt-7 inline-flex">
            Book a Free Session
          </Link>
        </div>
      </section>
    </div>
  );
}
