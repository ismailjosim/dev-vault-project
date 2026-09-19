import type { Metadata } from 'next'
import { TemplateList } from '@/components/templates/TemplateList'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import { getBuiltInTemplates } from '@/utils/templates'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Environment Templates',
	description:
		'Pre-configured environment variable templates for Next.js, MERN, Stripe, Firebase, AWS, Supabase, and more.',
}

export default async function TemplatesPage() {
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
					Environment templates
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Start projects faster with common environment variable sets.
				</p>
				<div className='mt-6'>
					<TemplateList templates={getBuiltInTemplates()} />
				</div>
			</div>
		</main>
	)
}
