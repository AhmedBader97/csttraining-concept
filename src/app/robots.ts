import type { MetadataRoute } from 'next';

// Unofficial concept: ask every crawler to stay away.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', disallow: '/' }] };
}
