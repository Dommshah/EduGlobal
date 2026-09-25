import Link from "next/link";
import { notFound } from "next/navigation";
import { api, BlogPost } from "@/lib/api";
import { dateFmt } from "@/lib/format";

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const [post, all] = await Promise.all([
    api.get<BlogPost>(`/blog/${params.slug}`).catch(() => null),
    api.get<BlogPost[]>("/blog").catch(() => []),
  ]);
  if (!post) notFound();
  const related = all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  const html = (post.content || "")
    .split("\n\n")
    .map((block) =>
      block.startsWith("## ")
        ? `<h2 class="font-display text-2xl font-bold text-ink-900 mt-8 mb-3">${block.slice(3)}</h2>`
        : `<p class="mb-4 leading-relaxed text-ink-900/75">${block}</p>`
    )
    .join("");

  return (
    <article className="pb-10">
      <header className={`bg-gradient-to-br ${post.gradient} py-16 text-white`}>
        <div className="section-pad max-w-3xl">
          <Link href="/blog" className="text-sm font-semibold text-white/70 hover:text-white">← All articles</Link>
          <span className="chip mt-6 block w-fit bg-white/20 backdrop-blur">{post.category}</span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight">{post.title}</h1>
          <p className="mt-3 text-white/75">
            {post.author} · {dateFmt(post.created_at)} · {post.read_minutes} min read
          </p>
        </div>
      </header>

      <div className="section-pad max-w-3xl py-12">
        <p className="mb-8 border-l-4 border-gold-500 pl-4 text-lg italic text-ink-900/70">{post.excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-12 rounded-3xl bg-ink-950 p-8 text-center text-white">
          <h3 className="font-display text-2xl font-bold">Want this handled for you?</h3>
          <p className="mt-2 text-white/65">Our counselors apply this exact playbook to every student file.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/enquire" className="btn-gold-3d">Book Free Counselling</Link>
            <Link href="/chat" className="glass-dark rounded-2xl px-6 py-3 font-semibold hover:bg-white/10">Ask EduGuide</Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-xl font-bold text-ink-900">Keep reading</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card-3d group rounded-2xl bg-white p-5 shadow-glass">
                  <span className="chip bg-brand-50 text-brand-700">{p.category}</span>
                  <p className="mt-2 font-display text-sm font-bold leading-snug group-hover:text-brand-700">{p.title}</p>
                  <p className="mt-2 text-[11px] text-ink-900/45">{p.read_minutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
