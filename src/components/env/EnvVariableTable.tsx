'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
	EnvVariableItem,
	EnvVariableSummary,
} from '@/components/env/EnvVariableItem'
import { EnvironmentCompareModal } from '@/components/env/compare'
import { Search, X, Filter, Sparkles } from 'lucide-react'

export function EnvVariableTable({
	projectId,
	variables,
	environments = ['dev', 'prod'],
}: {
	projectId: string
	variables: EnvVariableSummary[]
	environments?: string[]
}) {
	const router = useRouter()
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedType, setSelectedType] = useState<string>('all')
	const [isCompareOpen, setIsCompareOpen] = useState(false)

	const filteredVariables = useMemo(() => {
		return variables.filter((v) => {
			const matchesQuery =
				searchQuery === '' ||
				v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(v.note && v.note.toLowerCase().includes(searchQuery.toLowerCase()))

			const matchesType =
				selectedType === 'all' ||
				v.type.toLowerCase() === selectedType.toLowerCase()

			return matchesQuery && matchesType
		})
	}, [variables, searchQuery, selectedType])

	const secretsCount = useMemo(
		() => variables.filter((v) => v.type === 'secret').length,
		[variables],
	)

	return (
		<div className='space-y-4'>
			{/* Controls Bar: Search, Type Filter, Compare Button */}
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-1 items-center gap-2'>
					{/* Search input */}
					<div className='relative max-w-sm flex-1'>
						<Search className='text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2' />
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Filter by key or note...'
							className='border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-lg border py-1.5 pr-8 pl-9 text-xs focus:ring-1 focus:outline-none'
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								type='button'
								className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2'
							>
								<X className='h-3 w-3' />
							</button>
						)}
					</div>

					{/* Type Filter */}
					<div className='flex items-center gap-1.5'>
						<Filter className='text-muted-foreground h-3.5 w-3.5' />
						<select
							value={selectedType}
							onChange={(e) => setSelectedType(e.target.value)}
							className='border-border bg-card text-foreground focus:ring-primary rounded-lg border px-2.5 py-1.5 text-xs focus:ring-1 focus:outline-none'
						>
							<option value='all'>All Types</option>
							<option value='secret'>Secrets</option>
							<option value='api_key'>API Keys</option>
							<option value='database_url'>Database URLs</option>
							<option value='jwt'>JWTs</option>
							<option value='url'>URLs</option>
							<option value='other'>Other</option>
						</select>
					</div>
				</div>

				{/* Right Side: Comparison Button */}
				<div className='flex items-center gap-2'>
					<button
						onClick={() => setIsCompareOpen(true)}
						type='button'
						className='border-border/80 bg-card hover:bg-muted text-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors'
					>
						<Sparkles className='text-primary h-3.5 w-3.5' />
						<span>Compare Environments</span>
					</button>
				</div>
			</div>

			{/* Count & filter status */}
			<div className='text-muted-foreground flex items-center justify-between px-1 text-xs'>
				<span>
					Showing {filteredVariables.length} of {variables.length} variables
					{secretsCount > 0 && ` (${secretsCount} encrypted secrets)`}
				</span>
				{(searchQuery || selectedType !== 'all') && (
					<button
						onClick={() => {
							setSearchQuery('')
							setSelectedType('all')
						}}
						type='button'
						className='text-primary text-xs hover:underline'
					>
						Reset filters
					</button>
				)}
			</div>

			{/* Variables Table */}
			{filteredVariables.length === 0 ? (
				<div className='border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'>
					{variables.length === 0
						? 'No environment variables yet. Click "Add Variable" above to create one.'
						: 'No environment variables match your current search/filter.'}
				</div>
			) : (
				<div className='border-border bg-card overflow-x-auto rounded-xl border shadow-xs'>
					<table className='w-full min-w-190 text-left'>
						<thead>
							<tr className='border-border/60 bg-muted/40 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase'>
								<th className='px-4 py-3'>Key</th>
								<th className='px-4 py-3'>Value</th>
								<th className='px-4 py-3'>Type</th>
								<th className='px-4 py-3'>Environment</th>
								<th className='px-4 py-3'>Note</th>
								<th className='px-4 py-3 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-border/40 divide-y'>
							{filteredVariables.map((variable) => (
								<EnvVariableItem
									key={variable._id}
									projectId={projectId}
									variable={variable}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Environment Comparison Modal */}
			<EnvironmentCompareModal
				projectId={projectId}
				environments={environments}
				isOpen={isCompareOpen}
				onClose={() => setIsCompareOpen(false)}
				onClonedSuccess={() => {
					router.refresh()
				}}
			/>
		</div>
	)
}
