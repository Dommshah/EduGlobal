import Link from "next/link";
import { notFound } from "next/navigation";
import { api, University, Course } from "@/lib/api";
import { money } from "@/lib/format";

export default async function UniversityDetail({ params }: { params: { slug: string } }) {
  const uni = await api.get<University>(`/universities/${params.slug}`).catch(() => null);
  if (!uni) notFound();

  const courses = await api.get<Course[]>(`/universities/${params.slug}/courses`).catch(() => []);

  return (
    <div>
      <section className={`relative overflow-hidden bg-gradient-to-br ${uni.image_gradient} py-20 text-white`}>
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_75%_15%,white,transparent_45%)]" />
        <div className="section-pad relative">
          <Link href="/universities" className="text-sm font-semibold text-white/70 hover:text-white">
            ← All universities
          </Link>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">{uni.name}</h1>
          <p className="mt-3 text-white/80">
            📍 {uni.city} · Est. {uni.founded} · {uni.type}
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [`#${uni.world_rank ?? "—"}`, "World rank"],
              [`${uni.acceptance_rate}%`, "Acceptance"],
              [`${uni.programs_count}`, "Programs"],
              [`${money(uni.tuition_min)}+`, "Tuition/yr"],
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
          <h2 className="font-display text-2xl font-bold">About the university</h2>
          <p className="mt-4 leading-relaxed text-ink-900/70">{uni.description}</p>

          <h3 className="mt-12 font-display text-2xl font-bold">Popular courses</h3>
          <div className="mt-6 space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-ink-900/50">
                    {c.level} · {c.duration} · Intake {c.intake} · IELTS {c.ielts}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-brand-600">{money(c.tuition, c.currency)}</span>
                  <Link href={`/enquire?course=${c.id}`} className="btn-3d !px-4 !py-2 text-xs">
                    Apply
                  </Link>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-ink-900/50">Course list coming soon.</p>}
          </div>
        </div>

        <aside>
          <div className="sticky top-24 rounded-3xl border border-ink-100 bg-white p-6 shadow-glass">
            <h3 className="font-bold">Start your application</h3>
            <p className="mt-2 text-sm text-ink-900/60">
              A senior counselor will evaluate your profile for {uni.name} within 24 hours — free.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-900/70">
              <li>✓ Admission probability score</li>
              <li>✓ Scholarship opportunities</li>
              <li>✓ Document checklist</li>
            </ul>
            <Link href={`/enquire?university=${uni.slug}`} className="btn-gold-3d mt-6 w-full">
              Apply via Eduglobal
            </Link>
            <Link href="/chat" className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:underline">
              Ask AI about {uni.name} →
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
