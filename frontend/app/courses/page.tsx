import Link from "next/link";
import { CourseCard, SectionHeading } from "@/components/cards";
import { Reveal } from "@/components/motion";
import { api, Course, Country } from "@/lib/api";

export const metadata = { title: "Courses" };

const LEVELS = ["", "Bachelors", "Masters", "PhD", "Diploma"];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string; level?: string; country?: string };
}) {
  const qs = new URLSearchParams();
  if (searchParams.q) qs.set("q", searchParams.q);
  if (searchParams.level) qs.set("level", searchParams.level);
  if (searchParams.country) qs.set("country", searchParams.country);

  const [courses, countries] = await Promise.all([
    api.get<Course[]>(`/courses?${qs.toString()}`).catch(() => []),
    api.get<Country[]>("/countries").catch(() => []),
  ]);

  // Group by level for structure
  const groups = ["Bachelors", "Masters", "PhD", "Diploma"]
    .map((level) => ({ level, items: courses.filter((c) => c.level === level) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-16 text-white">
        <svg className="pointer-events-none absolute right-8 top-8 h-40 w-40 text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="48" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="48" ry="20" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="20" ry="48" strokeWidth="1" />
        </svg>
        <div className="section-pad relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Program Finder</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl font-bold leading-tight">
            Find the course that <span className="shimmer-text">finds you</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            200+ programs across 12 countries — from AI and finance to public health and design.
            Filter by level and destination, or search directly.
          </p>
          <form action="/courses" className="mx-auto mt-8 flex max-w-xl gap-2">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="e.g. Data Science, MBA, Nursing…"
              className="input-luxe flex-1 !bg-white/95"
            />
            <button className="btn-gold-3d !px-5">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {LEVELS.map((l) => (
              <Link
                key={l || "all"}
                href={l ? `/courses?level=${l}` : "/courses"}
                className={`chip px-4 py-2 ${
                  (searchParams.level ?? "") === l ? "bg-gold-500 text-ink-900" : "glass-dark text-white/80 hover:text-white"
                }`}
              >
                {l || "All levels"}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link
              href={`/courses${searchParams.level ? `?level=${searchParams.level}` : ""}`}
              className={`chip px-4 py-2 ${!searchParams.country ? "bg-gold-500 text-ink-900" : "glass-dark text-white/80"}`}
            >
              All countries
            </Link>
            {countries.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/courses?country=${c.slug}${searchParams.level ? `&level=${searchParams.level}` : ""}`}
                className={`chip px-4 py-2 ${searchParams.country === c.slug ? "bg-gold-500 text-ink-900" : "glass-dark text-white/80 hover:text-white"}`}
              >
                {c.flag} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-ink-100 bg-white py-5">
        <div className="section-pad grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            { v: `${courses.length}`, l: "Matching programs" },
            { v: `${countries.length}`, l: "Destinations" },
            { v: "15", l: "Course templates" },
            { v: "Sep / Jan", l: "Flexible intakes" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl font-bold text-brand-600">{s.v}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-900/45">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grouped listing */}
      <section className="section-pad py-14">
        {groups.map((g) => (
          <div key={g.level} className="mb-12 last:mb-0">
            <div className="mb-5 flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold text-ink-900">{g.level}</h2>
              <span className="chip bg-brand-50 text-brand-700">{g.items.length} programs</span>
              <div className="h-px flex-1 bg-gradient-to-r from-ink-200 to-transparent" />
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {g.items.slice(0, 9).map((c, i) => (
                <Reveal key={c.id} delay={(i % 3) * 70}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink-100 p-16 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-display text-xl font-bold text-ink-900">No courses matched</p>
            <p className="mt-1 text-sm text-ink-900/50">Try another keyword, level or country — or ask the AI counselor.</p>
            <Link href="/chat" className="btn-3d mt-5 inline-flex">Ask EduGuide</Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="section-pad pb-12">
        <div className="glass rounded-3xl p-10 text-center">
          <SectionHeading
            eyebrow="Not sure which fits?"
            title="Let our AI counselor shortlist for you"
            sub="Describe your goals, budget and grades — get a tailored program list in seconds."
          />
          <Link href="/chat" className="btn-3d mt-6 inline-flex">Chat with EduGuide 🤖</Link>
        </div>
      </section>
    </div>
  );
}
