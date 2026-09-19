import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { SecretShareTool } from '@/components/tools/SecretShareTool'
import { getCurrentUser } from '@/lib/session'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Ephemeral Secret Sharing ("Burn-After-Reading") | DevVault',
	description:
		'Share sensitive passwords, private keys, and environment variables securely using zero-knowledge client-side encryption that self-destructs upon reading.',
}

export default async function SecretSharePage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link
						href='/dashboard'
						className='text-muted-foreground hover:text-foreground text-sm'
					>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>
				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					Ephemeral secret sharing
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Generate zero-knowledge, self-destructing links to share credentials
					without leaving traces in Slack or email.
				</p>
				<div className='mt-6'>
					<SecretShareTool />
				</div>
			</div>
		</main>
	)
}
