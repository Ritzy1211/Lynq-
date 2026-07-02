import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { SERVICES } from "@/constants/services";
import { BLOG_POSTS } from "@/constants/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/pricing",
    "/portfolio",
    "/blog",
    "/contact",
    "/book",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const serviceRoutes = SERVICES.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogRoutes = BLOG_POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
