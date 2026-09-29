import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/session'
import {
	LandingNavbar,
	LandingHero,
	LandingFeaturesGrid,
	LandingSecurityArchitecture,
	LandingComparison,
	LandingCta,
	LandingFooter,
} from '@/components/landing'
import Link from 'next/link'
import { ArrowRight, LayoutDashboard } from 'lucide-react'

export const metadata: Metadata = {
	title: 'DevVault — Zero-Knowledge Environment Secrets & Config Manager',
	description:
		'DevVault encrypts, versions, and injects environment variables directly into developer processes. Eliminate plaintext .env files with AES-256 GCM, 1-click rollback, and ephemeral sharing.',
}

export default async function HomePage() {
	const user = await getCurrentUser()

	return (
		<div className='bg-background selection:bg-primary/20 selection:text-primary min-h-screen'>
			{/* Authenticated user notification bar */}
			{user && (
				<div className='border-border/60 bg-primary/10 border-b px-4 py-2.5 text-center text-xs font-medium sm:text-sm'>
					<div className='mx-auto flex max-w-7xl items-center justify-center gap-2'>
						<span>
							Logged in as <strong>{user.email}</strong>
						</span>
						<span className='text-muted-foreground'>•</span>
						<Link
							href='/dashboard'
							className='text-primary inline-flex items-center gap-1 font-semibold hover:underline'
						>
							<LayoutDashboard className='h-3.5 w-3.5' />
							<span>Go to Dashboard</span>
							<ArrowRight className='h-3 w-3' />
						</Link>
					</div>
				</div>
			)}

			<LandingNavbar />
			<main>
				<LandingHero />
				<LandingFeaturesGrid />
				<LandingSecurityArchitecture />
				<LandingComparison />
				<LandingCta />
			</main>
			<LandingFooter />
		</div>
	)
}
