import type { Metadata } from 'next'
import { ImportEnvFile } from '@/components/import/ImportEnvFile'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Import .env File',
	description:
		'Upload or paste environment variables and preview parsed values before importing into your project.',
}

export default async function ImportToolPage() {
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
					Import .env file
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Upload or paste environment variables and preview them before saving.
				</p>
				<div className='mt-6'>
					<ImportEnvFile
						projects={serializeDocument<{ _id: string; projectName: string }[]>(
							projects,
						)}
					/>
				</div>
			</div>
		</main>
	)
}
