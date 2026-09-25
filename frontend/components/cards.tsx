import Link from "next/link";
import { University, Country, Course } from "@/lib/api";
import { money, compact } from "@/lib/format";

/* Deterministic gradient per university name */
const BADGE_GRADIENTS = [
  "from-brand-500 to-brand-800",
  "from-gold-400 to-amber-600",
  "from-sky-500 to-blue-800",
  "from-rose-500 to-pink-700",
  "from-emerald-500 to-teal-700",
  "from-violet-500 to-purple-800",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-sky-700",
  "from-fuchsia-500 to-purple-700",
  "from-blue-500 to-indigo-800",
];

/** SVG monogram crest for a university (used in cards & marquee). */
export function UniBadge({
  name,
  size = "h-12 w-12",
  text = "text-base",
}: {
  name: string;
  size?: string;
  text?: string;
}) {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const g = BADGE_GRADIENTS[h % BADGE_GRADIENTS.length];
  const words = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w));
  const initials = (words.length >= 2 ? words.slice(0, 3) : name.split(/\s+/).slice(0, 2))
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={`relative grid ${size} shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${g} ${text} font-display font-bold text-white shadow-3d`}
      title={name}
    >
      <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
      <svg viewBox="0 0 24 24" className="absolute bottom-0.5 h-2.5 w-2.5 text-white/60" fill="currentColor" aria-hidden>
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
      </svg>
      {initials}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center = true,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-ink-900/60">{sub}</p>}
    </div>
  );
}

export function UniversityCard({ uni, countryName }: { uni: University; countryName?: string }) {
  return (
    <Link
      href={`/universities/${uni.slug}`}
      className="card-3d group flex flex-col overflow-hidden rounded-3xl bg-white shadow-glass"
    >
      <div className={`relative h-36 bg-gradient-to-br ${uni.image_gradient} p-4`}>
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_70%_20%,white,transparent_45%)]" />
        <span className="chip bg-white/20 text-white backdrop-blur">#{uni.world_rank ?? "—"} worldwide</span>
        <div className="mt-4 flex items-center gap-3">
          <UniBadge name={uni.name} size="h-11 w-11" text="text-sm" />
          <div>
            <p className="font-display text-lg font-bold leading-snug text-white">{uni.name}</p>
            <p className="text-xs text-white/70">
              📍 {uni.city}
              {countryName ? `, ${countryName}` : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="chip bg-brand-50 text-brand-700">{uni.type}</span>
          <span className="chip bg-emerald-50 text-emerald-700">{uni.acceptance_rate}% acceptance</span>
          <span className="chip bg-amber-50 text-amber-700">{uni.programs_count} programs</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-900/55">
          <span>
            Tuition <b className="text-ink-900">{money(uni.tuition_min)}–{money(uni.tuition_max)}</b>
          </span>
          <span className="font-semibold text-brand-600 transition group-hover:translate-x-0.5">Explore →</span>
        </div>
      </div>
    </Link>
  );
}

export function CountryCard({ country }: { country: Country }) {
  return (
    <Link
      href={`/countries/${country.slug}`}
      className="card-3d group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-glass"
    >
      <div className={`relative h-32 bg-gradient-to-br ${country.hero_gradient} p-4`}>
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_75%_25%,white,transparent_50%)]" />
        <span className="text-4xl drop-shadow-lg">{country.flag}</span>
        <p className="mt-2 font-display text-xl font-bold text-white">{country.name}</p>
        <p className="text-[11px] text-white/75">{country.tagline}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4 text-center">
        <div>
          <p className="text-sm font-bold text-ink-900">{country.universities_count}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-900/45">Partners</p>
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900">{country.visa_success_rate}%</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-900/45">Visa rate</p>
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900">{money(country.min_tuition)}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-900/45">From/yr</p>
        </div>
      </div>
    </Link>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="card-3d flex flex-col rounded-3xl bg-white p-5 shadow-glass">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="chip bg-brand-50 text-brand-700">{course.level}</span>
          <h3 className="mt-2 font-semibold leading-snug text-ink-900">{course.name}</h3>
          <p className="text-xs text-ink-900/50">
            {course.university?.name} · {course.university?.city}
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-ink-50 px-2.5 py-1.5 text-center text-[11px] font-bold text-brand-700">
          {course.intake}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-ink-900/60">{course.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-900/55">
        <span>
          💰 <b className="text-ink-900">{money(course.tuition, course.currency)}</b> · ⏱ {course.duration} · 🎯 IELTS {course.ielts}
        </span>
        <Link href="/enquire" className="font-semibold text-brand-600 hover:text-brand-700">
          Apply →
        </Link>
      </div>
    </div>
  );
}

export function TestimonialCard({ t }: { t: TestimonialLike }) {
  return (
    <div className="card-3d flex h-full flex-col rounded-3xl bg-white p-6 shadow-glass">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-gold-500">
          {Array.from({ length: t.rating }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 00.95.69h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 00-.36 1.12l1.28 3.96c.3.92-.75 1.69-1.54 1.12l-3.36-2.44a1 1 0 00-1.18 0l-3.36 2.44c-.79.57-1.84-.2-1.54-1.12l1.28-3.96a1 1 0 00-.36-1.12L2.06 9.39c-.78-.57-.38-1.81.59-1.81h4.16a1 1 0 00.95-.69l1.29-3.96z" />
            </svg>
          ))}
        </div>
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-100" fill="currentColor" aria-hidden>
          <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
        </svg>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-900/75">&ldquo;{t.content}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
        {t.avatar_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.avatar_image}
            alt={t.name}
            className={`h-11 w-11 shrink-0 rounded-2xl object-cover shadow-luxe ring-2 ring-white bg-gradient-to-br ${t.avatar_gradient}`}
          />
        ) : (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.avatar_gradient} text-sm font-bold text-white shadow-luxe`}>
            {t.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("")}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-900">{t.name}</p>
          <p className="truncate text-xs text-ink-900/50">
            {t.program} · {t.university}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialLike {
  name: string;
  program?: string;
  university?: string;
  content: string;
  rating: number;
  avatar_gradient: string;
  avatar_image?: string | null;
}
