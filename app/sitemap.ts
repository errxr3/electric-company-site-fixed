import type { MetadataRoute } from 'next';
import { seoLandingPages } from '@/lib/seoLandingPages';

const siteUrl = 'https://volteforce.ru';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/services', '/portfolio', '/reviews', '/contacts', '/about', '/privacy', ...seoLandingPages.map((page) => page.href)];
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
