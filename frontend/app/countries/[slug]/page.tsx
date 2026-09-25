import Link from "next/link";
import { notFound } from "next/navigation";
import { UniversityCard, SectionHeading } from "@/components/cards";
import { api, Country, University } from "@/lib/api";
import { money, compact } from "@/lib/format";

export default async function CountryDetail({ params }: { params: { slug: string } }) {
  const data = await api
    .get<{ country: Country; universities: University[] }>(`/countries/${params.slug}`)
    .catch(() => null);
  if (!data) notFound();

  const { country: c, universities } = data;

  return (
    <div>
      <section className={`relative overflow-hidden bg-gradient-to-br ${c.hero_gradient} py-20 text-white`}>
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_80%_10%,white,transparent_45%)]" />
        <div className="section-pad relative">
          <Link href="/countries" className="text-sm font-semibold text-white/70 hover:text-white">
            ← All destinations
          </Link>
          <div className="mt-6 flex flex-wrap items-end gap-6">
            <span className="text-7xl drop-shadow-xl">{c.flag}</span>
            <div>
              <h1 className="font-display text-5xl font-bold">{c.name}</h1>
              <p className="mt-2 text-lg text-white/80">{c.tagline}</p>
            </div>
          </div>
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [`${c.universities_count}`, "Partner universities"],
              [compact(c.students_count), "Students placed"],
              [`${c.visa_success_rate}%`, "Visa success"],
              [money(c.min_tuition), "Tuition from/yr"],
            ].map(([v, l]) => (
              <div key={l} className="glass-dark rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold-300">{v}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-white/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad grid gap-10 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold">Why students choose {c.name}</h2>
          <p className="mt-4 leading-relaxed text-ink-900/70">{c.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(c.highlights ?? []).map((h) => (
              <div key={h} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">✦</span>
                <p className="text-sm font-medium text-ink-900/80">{h}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-glass">
            <h3 className="font-bold">Quick facts</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-900/55">Intakes</dt><dd className="font-semibold">{c.intakes}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-900/55">Living cost</dt><dd className="font-semibold">{money(c.avg_living_cost)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-ink-900/55">Tuition range</dt><dd className="font-semibold">{money(c.min_tuition)}+</dd></div>
              <div className="flex justify-between"><dt className="text-ink-900/55">Visa success</dt><dd className="font-semibold text-emerald-600">{c.visa_success_rate}%</dd></div>
            </dl>
            <Link href={`/enquire?country=${c.slug}`} className="btn-3d mt-6 w-full">
              Enquire for {c.name}
            </Link>
          </div>
        </aside>
      </section>

      <section className="bg-gradient-to-b from-white to-brand-50/40 py-16">
        <div className="section-pad">
          <SectionHeading eyebrow="Partners" title={`Universities in ${c.name}`} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <UniversityCard key={u.id} uni={u} countryName={c.name} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
