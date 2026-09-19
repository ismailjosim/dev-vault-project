import type { Metadata } from 'next'
import { CategoryFilter } from '@/components/snippets/CategoryFilter'
import { SnippetList } from '@/components/snippets/SnippetList'
import { SnippetSummary } from '@/components/snippets/SnippetCard'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Snippet } from '@/models/Snippet'
import { snippetQuerySchema } from '@/types/snippet'
import { getBuiltInSnippets } from '@/utils/snippets'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Code Snippets',
	description:
		'Browse, create, and manage reusable integration code snippets mapped to required environment variables.',
}

type SnippetsPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SnippetsPage({
	searchParams,
}: SnippetsPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const rawParams = await searchParams
	const query = snippetQuerySchema.parse({
		search: rawParams.search,
		category: rawParams.category,
		language: rawParams.language,
		tag: rawParams.tag,
	})
	const filter: Record<string, unknown> = { userId: user.id }

	if (query.search) {
		filter.$or = [
			{ title: { $regex: query.search, $options: 'i' } },
			{ description: { $regex: query.search, $options: 'i' } },
			{ tags: { $regex: query.search, $options: 'i' } },
		]
	}

	if (query.category) filter.category = query.category
	if (query.language) filter.language = query.language
	if (query.tag) filter.tags = query.tag

	const customSnippets = await Snippet.find(filter).sort({ createdAt: -1 })
	const builtIns = getBuiltInSnippets().filter((snippet) => {
		const searchText = [
			snippet.title,
			snippet.description,
			snippet.category,
			snippet.language,
			...snippet.tags,
			...snippet.requiredEnv,
		]
			.join(' ')
			.toLowerCase()

		return (
			(!query.search || searchText.includes(query.search.toLowerCase())) &&
			(!query.category || snippet.category === query.category) &&
			(!query.language || snippet.language === query.language) &&
			(!query.tag || snippet.tags.includes(query.tag))
		)
	})

	const snippets: SnippetSummary[] = [
		...builtIns.map((snippet) => ({
			...snippet,
			_id: snippet.id,
		})),
		...serializeDocument<SnippetSummary[]>(customSnippets),
	]
	const categories = Array.from(
		new Set([
			...getBuiltInSnippets().map((snippet) => snippet.category),
			...serializeDocument<{ category: string }[]>(customSnippets).map(
				(snippet) => snippet.category,
			),
		]),
	).sort()

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link href='/dashboard' className='text-muted-foreground text-sm'>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
					<div>
						<h1 className='text-foreground text-2xl font-semibold'>
							Code snippets
						</h1>
						<p className='text-muted-foreground mt-1 text-sm'>
							Store reusable setup code and track required environment keys.
						</p>
					</div>
					<Link
						href='/dashboard/snippets/create'
						className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
					>
						New snippet
					</Link>
				</div>

				<div className='mt-6'>
					<CategoryFilter categories={categories} />
				</div>

				<div className='mt-6'>
					<SnippetList snippets={snippets} />
				</div>
			</div>
		</main>
	)
}
