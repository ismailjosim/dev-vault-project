import type { Metadata } from 'next'
import { PasswordGenerator } from '@/components/tools/PasswordGenerator'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Password Generator',
	description:
		'Create cryptographically strong, random passwords with configurable character options.',
}

export default async function PasswordGeneratorPage() {
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
					Password generator
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Create strong passwords with configurable character rules.
				</p>
				<div className='mt-6'>
					<PasswordGenerator />
				</div>
			</div>
		</main>
	)
}
