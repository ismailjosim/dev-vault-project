import type { Metadata } from 'next'
import { TagCloud, TagSummary } from '@/components/common/TagCloud'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Project Tags',
	description:
		'Browse tags and filter projects across your DevVault environment.',
}

export default async function TagsPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const projects = await Project.find({ userId: user.id }).select('tags')
	const counts = new Map<string, number>()

	for (const project of projects) {
		for (const tag of project.tags) {
			counts.set(tag, (counts.get(tag) || 0) + 1)
		}
	}

	const tags: TagSummary[] = Array.from(counts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link href='/dashboard' className='text-muted-foreground text-sm'>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>

				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					Project tags
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Browse tag usage and jump into filtered project views.
				</p>

				<div className='mt-6'>
					<TagCloud tags={tags} />
				</div>
			</div>
		</main>
	)
}
