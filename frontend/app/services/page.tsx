import Link from "next/link";
import { SectionHeading } from "@/components/cards";

const SERVICES = [
  { icon: "🎯", title: "Profile Evaluation & Counselling", desc: "A 360° review of academics, tests, budget and goals — then a country & course map you can act on the same day.", tag: "Free" },
  { icon: "🏛️", title: "University Shortlisting", desc: "8–10 best-fit programs balanced across ambitious, match and safe categories, with admission probability scores.", tag: "Included" },
  { icon: "✍️", title: "SOP / Essay Crafting", desc: "Story-first editing by counselors who've read thousands of committees' yeses and noes. Unlimited revisions.", tag: "Included" },
  { icon: "📄", title: "Application Management", desc: "We fill, proof and submit every portal. You watch statuses update live in your dashboard.", tag: "Included" },
  { icon: "💰", title: "Scholarship Hunt", desc: "We match you to merit awards, government schemes and partner grants — $25M won and counting.", tag: "Included" },
  { icon: "🛂", title: "Visa Filing & Mock Interviews", desc: "Financial documentation, biometrics booking and consular-grade mock interviews. 94% success rate.", tag: "Included" },
  { icon: "🏦", title: "Education Loans & Forex", desc: "Partner banks pre-approve loans at student rates; forex and remittance set up before you fly.", tag: "Partner" },
  { icon: "🏠", title: "Pre-departure & Settlement", desc: "Accommodation, SIM, insurance, airport pickup and a alumni buddy at your destination city.", tag: "Included" },
];

const PACKAGES = [
  {
    name: "Explorer",
    price: "Free",
    desc: "Taste the Eduglobal experience",
    features: ["1 counselling session", "Country comparison report", "Course shortlist (3 options)", "EduGuide AI access"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Signature",
    price: "$499",
    desc: "Our flagship, end-to-end",
    features: ["Unlimited counselling", "8–10 university applications", "SOP/LOR crafting", "Scholarship filing", "Visa + mock interviews", "Pre-departure support"],
    cta: "Go Signature",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$1,299",
    desc: "For Ivy & Oxbridge ambitions",
    features: ["Everything in Signature", "Ex-Ivy/Oxbridge mentor", "Research proposal support", "Interview coaching", "Family immigration brief"],
    cta: "Request Invite",
    highlight: false,
  },
];

export default function ServicesPage() {
  return (
    <div>
      <section className="hero-mesh py-20 text-white">
        <div className="section-pad text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Our Services</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl font-bold">
            Every step. One hand to hold.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/70">
            From the first profile call to the first day of class — eight services, one accountable team, zero
            surprises.
          </p>
        </div>
      </section>

      <section className="section-pad py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="card-3d flex flex-col rounded-3xl bg-white p-6 shadow-glass">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{s.icon}</span>
                <span className={`chip ${s.tag === "Free" ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600"}`}>
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-900/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-brand-50/40 py-20">
        <div className="section-pad">
          <SectionHeading eyebrow="Packages" title="Choose your journey" sub="Transparent pricing. No commission conflicts — ever." />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PACKAGES.map((p) => (
              <div
                key={p.name}
                className={`card-3d relative flex flex-col rounded-[2rem] p-8 ${
                  p.highlight ? "bg-ink-950 text-white shadow-luxe-lg" : "bg-white shadow-glass"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-1 text-xs font-bold text-ink-900 shadow-3d-gold">
                    MOST POPULAR
                  </span>
                )}
                <h3 className={`font-display text-2xl font-bold ${p.highlight ? "text-gold-400" : "text-ink-900"}`}>{p.name}</h3>
                <p className={`text-sm ${p.highlight ? "text-white/60" : "text-ink-900/55"}`}>{p.desc}</p>
                <p className="mt-4 font-display text-4xl font-bold">{p.price}</p>
                <ul className={`mt-6 flex-1 space-y-2.5 text-sm ${p.highlight ? "text-white/75" : "text-ink-900/70"}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={p.highlight ? "text-gold-400" : "text-brand-600"}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/enquire" className={`${p.highlight ? "btn-gold-3d" : "btn-3d"} mt-8`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad py-16 text-center">
        <h2 className="font-display text-3xl font-bold">Not sure which fits?</h2>
        <p className="mt-2 text-ink-900/60">Take the free Explorer session — upgrade only if it feels right.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/enquire" className="btn-3d">Book Free Counselling</Link>
          <Link href="/chat" className="rounded-2xl border border-ink-100 bg-white px-6 py-3 font-semibold hover:border-brand-200">
            Ask EduGuide AI
          </Link>
        </div>
      </section>
    </div>
  );
}
