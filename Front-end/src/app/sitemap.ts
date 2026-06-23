import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type HrefLangEntry = { href: string; hrefLang: string };

const staticRoutes: { path: string; changefreq?: string; priority?: number; alternates?: HrefLangEntry[] }[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/vehicules", priority: 0.9, changefreq: "daily" },
  { path: "/a-propos", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/faq", priority: 0.6, changefreq: "monthly" },
  { path: "/regles", priority: 0.6, changefreq: "monthly" },
  { path: "/terms", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.6, changefreq: "monthly" },
  { path: "/insurance", priority: 0.6, changefreq: "monthly" },
  { path: "/assurance", priority: 0.6, changefreq: "monthly" },
  { path: "/company/blog", priority: 0.7, changefreq: "weekly" },
  { path: "/company/press", priority: 0.5, changefreq: "weekly" },
  { path: "/company/careers", priority: 0.5, changefreq: "weekly" },
  { path: "/support/help-center", priority: 0.5, changefreq: "monthly" },
  { path: "/support/cancellation", priority: 0.5, changefreq: "monthly" },
];

const localePrefixes = ["", "/en", "/ar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const prefix of localePrefixes) {
      const loc = `${SITE_URL}${prefix}${route.path}`;
      entries.push({
        url: loc,
        lastModified: new Date(),
        changeFrequency: (route.changefreq as any) || "weekly",
        priority: route.priority || 0.5,
        alternates: route.alternates
          ? { languages: Object.fromEntries(route.alternates.map((a) => [a.hrefLang, a.href])) }
          : undefined,
      });
    }
  }

  // Fetch vehicles from API for dynamic sitemap entries
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiUrl}/Vehicles`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const vehicles = json.data || json.vehicles || json;

      if (Array.isArray(vehicles)) {
        for (const vehicle of vehicles) {
          const id = vehicle.id || vehicle.slug;
          if (!id) continue;

          const slug = (vehicle.marque && vehicle.modele)
            ? `${vehicle.marque}-${vehicle.modele}`.toLowerCase().replace(/\s+/g, "-")
            : String(id);

          for (const prefix of localePrefixes) {
            entries.push({
              url: `${SITE_URL}${prefix}/vehicules/${slug || id}`,
              lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date(),
              changeFrequency: "daily",
              priority: 0.9,
            });
          }
        }
      }
    }
  } catch {
    // If the API isn't reachable during build, just use static routes
  }

  // Fetch blog posts
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiUrl}/blogs`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const blogs = json.data || json.blogs || json;

      if (Array.isArray(blogs)) {
        for (const blog of blogs) {
          const slug = blog.slug;
          if (!slug) continue;

          for (const prefix of localePrefixes) {
            entries.push({
              url: `${SITE_URL}${prefix}/company/blog/${slug}`,
              lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        }
      }
    }
  } catch {
    // Silently fail
  }

  return entries;
}
