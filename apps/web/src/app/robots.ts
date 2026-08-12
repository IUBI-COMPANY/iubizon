import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const aiUserAgents = [
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Google-Extended",
    "Applebot-extended",
    "cohere-ai",
    "Anthropic-ai",
    "PerplexityBot",
  ];

  const rules = [
    {
      userAgent: "Googlebot",
      allow: "/",
      disallow: ["/api/"],
    },
    {
      userAgent: "Googlebot-Image",
      allow: "/",
      disallow: ["/api/"],
    },
    ...aiUserAgents.map((agent) => ({
      userAgent: agent,
      allow: "/",
      disallow: ["/api/"],
    })),
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.iubizon.com";

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
