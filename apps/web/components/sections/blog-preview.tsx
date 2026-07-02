import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/constants/blog";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

export function BlogPreviewSection() {
  const featured = BLOG_POSTS.slice(0, 3);
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14">
          <SectionHeading
            eyebrow="Insights"
            title={<>Property care, <span className="gradient-text">demystified</span>.</>}
            description="Operational notes from our service teams — how we plan, price and deliver premium cleaning programs."
            align="left"
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-accent transition-colors group"
          >
            All articles
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {featured.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full"
              >
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
      </div>
    </section>
  );
}
