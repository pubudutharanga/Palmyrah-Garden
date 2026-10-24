import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const prototype = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";

export default function sitemap(): MetadataRoute.Sitemap {
  if (prototype) return [];

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/rooms", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/book", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/explore", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
