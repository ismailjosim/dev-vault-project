import type { Metadata } from 'next'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Create Project',
	description:
		'Create a new project in DevVault to organize and encrypt environment variables across environments.',
}

export default async function CreateProjectPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

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
					Create project
				</h1>
				<div className='border-border bg-card mt-6 rounded-lg border p-6'>
					<ProjectForm />
				</div>
			</div>
		</main>
	)
}
