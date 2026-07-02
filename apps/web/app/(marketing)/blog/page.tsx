import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BLOG_POSTS } from "@/constants/blog";
import { FadeIn } from "@/components/shared/fade-in";
import { CtaSection } from "@/components/sections/cta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Operational notes, guides and insights from our service teams.",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={<>Property care, <span className="gradient-text">demystified</span>.</>}
        description="Operational notes from our service teams — how we plan, price and deliver premium cleaning programs."
      />

      {/* Featured */}
      <section className="container-wide">
        <Link href={`/blog/${featured.slug}`} className="group block">
          <FadeIn className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className={cn("lg:col-span-7 relative aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-br border border-border/70 shadow-soft", featured.cover.gradient)}>
              <div className="absolute inset-0 grid-bg opacity-25" />
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-foreground shadow-subtle">
                  Featured · {featured.category}
                </span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-tight group-hover:text-accent transition-colors">
                {featured.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center size-8 rounded-full bg-foreground text-white text-[11px] font-semibold">
                    {featured.author.initials}
                  </span>
                  <span className="font-medium text-foreground/80">{featured.author.name}</span>
                </div>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {featured.readingTime}
                </span>
              </div>
            </div>
          </FadeIn>
        </Link>
      </section>

      <section className="section-padding">
        <div className="container-wide grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {rest.map((post, i) => (
            <FadeIn key={post.slug} delay={(i % 3) * 0.06}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="h-full flex flex-col rounded-3xl border border-border/70 bg-card overflow-hidden transition-all duration-500 hover:shadow-lift hover:-translate-y-1">
                  <div className={cn("relative aspect-[16/10] overflow-hidden bg-gradient-to-br", post.cover.gradient)}>
                    <div className="absolute inset-0 grid-bg opacity-25" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-foreground shadow-subtle">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display text-xl font-semibold leading-snug group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                      <div className="flex items-center gap-2.5">
                        <span className="grid place-items-center size-7 rounded-full bg-foreground text-white text-[10px] font-semibold">
                          {post.author.initials}
                        </span>
                        <span className="font-medium text-foreground/80">{post.author.name}</span>
                      </div>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {post.readingTime}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
