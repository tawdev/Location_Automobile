/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.carforfar.ma",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/*", "/profile/*", "/MyReservations/*", "/api/*"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    additionalSitemaps: [
      "https://www.carforfar.ma/sitemap.xml",
    ],
  },
  exclude: [
    "/admin/*",
    "/profile/*",
    "/MyReservations/*",
    "/api/*",
    "/auth/*",
    "/login",
    "/register",
    "/signup",
    "/forgot-password",
    "/auth/callback/*",
    "/MyReservations/new/*",
  ],
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === "/") {
      priority = 1.0;
      changefreq = "daily";
    } else if (path.startsWith("/vehicules")) {
      priority = 0.9;
      changefreq = "daily";
    } else if (path.startsWith("/company/blog")) {
      priority = 0.7;
      changefreq = "weekly";
    } else if (["/a-propos", "/contact", "/faq", "/regles", "/terms", "/privacy", "/insurance"].includes(path)) {
      priority = 0.6;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
