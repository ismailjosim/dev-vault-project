import type { Metadata } from 'next'
import {
	SnippetDetail,
	SnippetViewer,
} from '@/components/snippets/SnippetViewer'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Snippet } from '@/models/Snippet'
import { getBuiltInSnippet } from '@/utils/snippets'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type SnippetPageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: SnippetPageProps): Promise<Metadata> {
	const { id } = await params
	const builtIn = getBuiltInSnippet(id)
	if (builtIn) {
		return {
			title: `${builtIn.title} - Snippet`,
			description: builtIn.description,
		}
	}

	const user = await getCurrentUser()
	if (!user?.id) return { title: 'Snippet Details' }

	await connectDB()
	const customSnippet = await Snippet.findOne({
		_id: id,
		userId: user.id,
	}).select('title description')
	if (!customSnippet) return { title: 'Snippet Not Found' }

	return {
		title: `${customSnippet.title} - Snippet`,
		description:
			customSnippet.description ||
			`Reusable code snippet for ${customSnippet.title}.`,
	}
}

export default async function SnippetPage({ params }: SnippetPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	const { id } = await params
	const builtInSnippet = getBuiltInSnippet(id)
	let snippet: SnippetDetail | null = builtInSnippet
		? {
				...builtInSnippet,
				_id: builtInSnippet.id,
			}
		: null

	if (!snippet) {
		await connectDB()
		const customSnippet = await Snippet.findOne({ _id: id, userId: user.id })
		if (!customSnippet) notFound()
		snippet = serializeDocument<SnippetDetail>(customSnippet)
	}

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='mb-4 flex items-center justify-between'>
					<Link
						href='/dashboard/snippets'
						className='text-muted-foreground text-sm'
					>
						Back to snippets
					</Link>
					<ThemeToggle />
				</div>
				<SnippetViewer snippet={snippet} />
			</div>
		</main>
	)
}
