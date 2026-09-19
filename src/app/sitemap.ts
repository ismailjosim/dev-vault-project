import type { MetadataRoute } from 'next'
import { builtInTemplates } from '@/utils/templates'

export default function sitemap(): MetadataRoute.Sitemap {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	const currentDate = new Date()

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: appUrl,
			lastModified: currentDate,
			changeFrequency: 'weekly',
			priority: 1.0,
		},
		{
			url: `${appUrl}/auth/login`,
			lastModified: currentDate,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${appUrl}/auth/signup`,
			lastModified: currentDate,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
	]

	const templateRoutes: MetadataRoute.Sitemap = builtInTemplates.map(
		(template) => ({
			url: `${appUrl}/dashboard/templates/${template.id}`,
			lastModified: currentDate,
			changeFrequency: 'monthly',
			priority: 0.6,
		}),
	)

	return [...staticRoutes, ...templateRoutes]
}
