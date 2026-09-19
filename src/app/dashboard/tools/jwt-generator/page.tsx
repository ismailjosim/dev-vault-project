import type { Metadata } from 'next'
import { JWTGenerator } from '@/components/tools/JWTGenerator'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'JWT Secret Generator',
	description:
		'Generate high-entropy access and refresh token secrets formatted for environment files.',
}

export default async function JWTGeneratorPage() {
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
					JWT secret generator
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Generate access and refresh token secrets with .env formatting.
				</p>
				<div className='mt-6'>
					<JWTGenerator />
				</div>
			</div>
		</main>
	)
}
