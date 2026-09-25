import Link from "next/link";

const COLS = [
  {
    title: "Destinations",
    links: [
      ["Study in UK", "/countries/united-kingdom"],
      ["Study in Canada", "/countries/canada"],
      ["Study in Australia", "/countries/australia"],
      ["Study in USA", "/countries/united-states"],
      ["Study in Germany", "/countries/germany"],
      ["All destinations", "/countries"],
    ],
  },
  {
    title: "Platform",
    links: [
      ["Universities", "/universities"],
      ["Courses", "/courses"],
      ["AI Counselor", "/chat"],
      ["Success Stories", "/testimonials"],
      ["Blog & Guides", "/blog"],
      ["FAQs", "/faq"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Our Services", "/services"],
      ["Contact", "/contact"],
      ["Support Centre", "/support"],
      ["Careers", "/about"],
      ["Free Counselling", "/enquire"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-950 text-white">
      <div className="divider-glow" />
      <div className="section-pad grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold shadow-3d">E</span>
            <span className="font-display text-2xl font-bold">
              Edu<span className="text-gradient-gold">global</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            For 18 years, Eduglobal has turned study-abroad dreams into offer letters — 12,000+ students placed in
            850+ partner universities across 28 countries.
          </p>
          <div className="mt-5 flex gap-3">
            {["𝕏", "in", "f", "◎"].map((s) => (
              <span key={s} className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white/8 text-sm transition hover:bg-brand-600">
                {s}
              </span>
            ))}
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gold-400">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/60 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="section-pad flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Eduglobal International Education Consultants. All rights reserved.</p>
          <p>Crafted with 🌍 around the world · hello@eduglobal.com</p>
        </div>
      </div>
    </footer>
  );
}
