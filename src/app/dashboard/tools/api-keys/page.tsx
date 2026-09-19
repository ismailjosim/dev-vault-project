import type { Metadata } from 'next'
import { ApiKeysManager } from '@/components/tools/ApiKeysManager'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { ApiKey } from '@/models/ApiKey'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Developer CLI & API Keys',
	description:
		'Manage Personal Access Tokens (PAT) and CLI authentication for local secret injection.',
}

export default async function ApiKeysPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()

	const keys = await ApiKey.find({ userId: user.id })
		.select('-hashedKey')
		.sort({ createdAt: -1 })

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-5xl'>
				<div className='flex items-center justify-between'>
					<Link
						href='/dashboard'
						className='text-muted-foreground hover:text-foreground text-sm'
					>
						← Back to dashboard
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 mb-8'>
					<h1 className='text-foreground text-2xl font-bold'>
						Developer CLI & Access Tokens
					</h1>
					<p className='text-muted-foreground mt-1 text-sm'>
						Generate cryptographic personal access tokens to securely run local
						processes and scripts with live secrets injected in-memory.
					</p>
				</div>

				<ApiKeysManager initialKeys={serializeDocument(keys)} />
			</div>
		</main>
	)
}
