import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seoPages } from "../src/data/seoPages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const siteUrl = (process.env.VITE_SITE_URL || "https://interview.localjobshub.in").replace(/\/+$/, "");
const now = new Date().toISOString();

const staticRoutes = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/blog",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-cancellation-policy",
  "/resources/interview-questions",
];

const allRoutes = [
  ...staticRoutes.map((route) => ({
    loc: `${siteUrl}${route}`,
    changefreq: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? "1.0" : "0.8",
  })),
  ...seoPages.map((page) => ({
    loc: `${siteUrl}/resources/interview-questions/${page.slug}`,
    changefreq: "weekly",
    priority: "0.75",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), xml, "utf8");
await writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`Sitemap generated with ${allRoutes.length} URLs`);
