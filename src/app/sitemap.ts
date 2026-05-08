import type { MetadataRoute } from 'next'
import { CITIES } from '@/lib/cities'
import { NEIGHBORHOODS } from '@/lib/neighborhoods'

const BASE_URL = 'https://renewshine.co'
const PRIMARY_CITY_SLUGS = ['washington-dc', 'bethesda-md', 'arlington-va']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/locations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE_URL}/locations/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: PRIMARY_CITY_SLUGS.includes(city.slug) ? 0.9 : 0.7,
  }))
  const neighborhoodPages: MetadataRoute.Sitemap = NEIGHBORHOODS.map((n) => ({
    url: `${BASE_URL}/locations/${n.citySlug}/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  return [...staticPages, ...cityPages, ...neighborhoodPages]
}
