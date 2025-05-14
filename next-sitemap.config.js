/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://yourdomain.com", // 🔁 Replace with your actual domain
    generateRobotsTxt: true,
    exclude: ['/api/*'], // Excludes API routes
    priority: 0.7, // Default priority
    changefreq: 'daily', // Default change frequency
  };
  