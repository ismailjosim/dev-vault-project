import type { Metadata } from 'next'
import { BrandLogo } from '@/components/common/BrandLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Authentication Error',
	description:
		'An authentication error occurred while accessing DevVault. Please try logging in again.',
	robots: {
		index: false,
		follow: false,
	},
}

type AuthErrorPageProps = {
	searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({
	searchParams,
}: AuthErrorPageProps) {
	const params = await searchParams
	const errorMessage = params.error || 'An authentication error occurred'

	return (
		<main className='bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
			<div className='absolute top-6 right-6'>
				<ThemeToggle />
			</div>
			<div className='w-full max-w-md'>
				<div className='text-center'>
					<BrandLogo href='/auth/login' />
					<h1 className='text-danger mt-2 text-xl font-semibold'>
						Authentication Error
					</h1>
					<p className='text-muted-foreground mt-4 text-sm'>{errorMessage}</p>
				</div>

				<div className='mt-8'>
					<Link
						href='/auth/login'
						className='bg-primary text-primary-foreground block w-full rounded-md px-4 py-2 text-center text-sm font-semibold hover:opacity-90'
					>
						Back to Login
					</Link>
				</div>
			</div>
		</main>
	)
}
