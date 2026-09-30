/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "https://example.com",
    generateRobotsTxt: true,
    exclude: ['/api/*'], // Excludes API routes
    priority: 0.7, // Default priority
    changefreq: 'daily', // Default change frequency
  };
  