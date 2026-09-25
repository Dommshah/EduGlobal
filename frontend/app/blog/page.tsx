import Link from "next/link";
import { api, BlogPost, Quote } from "@/lib/api";
import { dateFmt } from "@/lib/format";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Blog & Guides" };

export default async function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const [posts, all, quotes] = await Promise.all([
    api.get<BlogPost[]>(`/blog${searchParams.category ? `?category=${encodeURIComponent(searchParams.category)}` : ""}`).catch(() => []),
    api.get<BlogPost[]>("/blog").catch(() => []),
    api.get<Quote[]>("/quotes").catch(() => []),
  ]);
  const categories = ["All", ...Array.from(new Set(all.map((p) => p.category)))];
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden py-16 text-white">
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 animate-float-slow rounded-full bg-brand-500/20 blur-3xl" />
        <div className="section-pad relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Blog &amp; Guides</p>
          <h1 className="mt-3 font-display text-5xl font-bold">Counsel-worthy reading</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Applications, scholarships, visas and city guides — written by the counselors who file them daily.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-4 text-sm">
            {[
              [`${all.length}`, "Expert articles"],
              [`${Array.from(new Set(all.map((p) => p.category))).length}`, "Topics"],
              ["25 min", "Avg. read time"],
            ].map(([v, l]) => (
              <div key={l} className="glass-dark rounded-2xl px-6 py-3">
                <p className="font-display text-xl font-bold text-gold-400">{v}</p>
                <p className="text-[11px] uppercase tracking-wide text-white/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="section-pad pt-10">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={c === "All" ? "/blog" : `/blog?category=${encodeURIComponent(c)}`}
              className={`chip px-4 py-2 ${
                (searchParams.category ?? "All") === c ? "bg-brand-600 text-white" : "bg-white text-ink-900/70 shadow-glass hover:bg-brand-50"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="card-3d group mt-10 grid overflow-hidden rounded-3xl bg-white shadow-luxe md:grid-cols-2">
              <div className={`relative min-h-56 bg-gradient-to-br ${featured.gradient} p-8`}>
                <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_70%_20%,white,transparent_45%)]" />
                <span className="chip bg-white/20 text-white backdrop-blur">⭐ Featured · {featured.category}</span>
                <p className="mt-16 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">{featured.title}</p>
              </div>
              <div className="flex flex-col justify-center p-8">
                <p className="text-ink-900/70">{featured.excerpt}</p>
                <p className="mt-4 text-xs font-semibold text-ink-900/45">
                  ✍️ {featured.author} · {dateFmt(featured.created_at)} · {featured.read_minutes} min read
                </p>
                <span className="mt-4 font-semibold text-brand-600 transition group-hover:translate-x-1">Read the guide →</span>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 70}>
              <Link href={`/blog/${p.slug}`} className="card-3d group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-glass">
                <div className={`relative flex h-36 items-end bg-gradient-to-br ${p.gradient} p-4`}>
                  <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_75%_25%,white,transparent_50%)]" />
                  <span className="chip bg-white/20 text-white backdrop-blur">{p.category}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold leading-snug group-hover:text-brand-700">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-900/60">{p.excerpt}</p>
                  <p className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-900/45">
                    {p.author} · {dateFmt(p.created_at)} · {p.read_minutes} min read
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-ink-100 p-16 text-center text-ink-900/50">
            No articles in this category yet.
          </div>
        )}
      </section>

      {/* Quote + CTA */}
      <section className="section-pad pb-14">
        {quotes[1] && (
          <Reveal>
            <div className="glass mx-auto max-w-3xl rounded-3xl p-10 text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-gold-500" fill="currentColor">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>
              <p className="mt-3 font-display text-2xl font-medium text-ink-900/85">&ldquo;{quotes[1].text}&rdquo;</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">— {quotes[1].author}</p>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
