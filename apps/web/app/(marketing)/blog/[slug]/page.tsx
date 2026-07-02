import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { BLOG_POSTS } from "@/constants/blog";
import { CtaSection } from "@/components/sections/cta";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <article className="container-wide max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> All articles
        </Link>

        <header className="mt-8 space-y-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="size-3.5" /> {post.readingTime}
            </span>
            <span className="text-muted-foreground text-xs">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="heading-hero">{post.title}</h1>
          <p className="body-lg">{post.excerpt}</p>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-10 rounded-full bg-gradient-to-br from-accent to-secondary text-white text-sm font-semibold">
                {post.author.initials}
              </span>
              <div>
                <div className="text-sm font-medium">{post.author.name}</div>
                <div className="text-xs text-muted-foreground">{post.author.role}</div>
              </div>
            </div>
            <button className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white px-4 py-2 text-xs font-medium hover:bg-foreground hover:text-white transition-colors">
              <Share2 className="size-3.5" /> Share
            </button>
          </div>
        </header>

        <div className={cn("mt-12 relative aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br border border-border/70 shadow-soft", post.cover.gradient)}>
          <div className="absolute inset-0 grid-bg opacity-25" />
        </div>

        <div className="mt-12 space-y-6 text-foreground/85 text-lg leading-relaxed">
          {post.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      <section className="section-padding">
        <div className="container-wide">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-10">Keep reading</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-3xl border border-border/70 bg-card overflow-hidden hover:shadow-lift hover:-translate-y-1 transition-all">
                <div className={cn("relative aspect-[16/10] bg-gradient-to-br", p.cover.gradient)}>
                  <div className="absolute inset-0 grid-bg opacity-25" />
                </div>
                <div className="p-6">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wider">{p.category}</div>
                  <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-accent transition-colors">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
