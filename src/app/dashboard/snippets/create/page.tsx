import type { Metadata } from 'next'
import { SnippetForm } from '@/components/snippets/SnippetForm'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Create Snippet',
	description:
		'Save a reusable code snippet and link required environment variables in DevVault.',
}

export default async function CreateSnippetPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link
						href='/dashboard/snippets'
						className='text-muted-foreground text-sm'
					>
						Back to snippets
					</Link>
					<ThemeToggle />
				</div>
				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					Create snippet
				</h1>
				<div className='border-border bg-card mt-6 rounded-lg border p-6'>
					<SnippetForm />
				</div>
			</div>
		</main>
	)
}
