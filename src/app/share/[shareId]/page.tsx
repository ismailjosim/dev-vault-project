import { BrandLogo } from '@/components/common/BrandLogo'
import { SharedSecretViewer } from '@/components/share/SharedSecretViewer'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import type { Metadata } from 'next'

interface PageProps {
	params: Promise<{ shareId: string }>
}

export const metadata: Metadata = {
	title: 'Encrypted Ephemeral Secret | DevVault',
	description:
		'Secure, zero-knowledge ephemeral secret sharing. Self-destructs after viewing.',
	robots: {
		index: false,
		follow: false,
		noarchive: true,
		nosnippet: true,
	},
}

export default async function SharedSecretPage({ params }: PageProps) {
	const { shareId } = await params

	return (
		<main className='bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12'>
			<div className='w-full max-w-lg'>
				<header className='mb-8 flex items-center justify-between'>
					<BrandLogo href='/' size='sm' />
					<ThemeToggle />
				</header>

				<h1 className='sr-only'>Secure Ephemeral Secret Retrieval</h1>

				<SharedSecretViewer shareId={shareId} />

				<footer className='text-muted-foreground mt-8 text-center text-xs'>
					Protected by DevVault Zero-Knowledge Ephemeral Encryption.
				</footer>
			</div>
		</main>
	)
}
