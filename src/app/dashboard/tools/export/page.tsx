import type { Metadata } from 'next'
import { ExportModal } from '@/components/export/ExportModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Export Environment Files',
	description:
		'Export project environment variables to .env, .env.local, JSON, YAML, Markdown, or .env.example formats.',
}

export default async function ExportToolPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const projects = await Project.find({ userId: user.id })
		.sort({ isPinned: -1, createdAt: -1 })
		.select('_id projectName')

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
					Export environment files
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Generate .env variants, JSON, YAML, Markdown, or .env.example.
				</p>
				<div className='mt-6'>
					<ExportModal
						projects={serializeDocument<{ _id: string; projectName: string }[]>(
							projects,
						)}
					/>
				</div>
			</div>
		</main>
	)
}
