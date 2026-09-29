import { Download, RotateCcw, Search } from 'lucide-react'

interface AuditLogFilterBarProps {
	searchQuery: string
	actionFilter: string
	envFilter: string
	onFilterChange: (type: 'action' | 'env' | 'search', value: string) => void
	onRefresh: () => void
	onExportCsv: () => void
}

export function AuditLogFilterBar({
	searchQuery,
	actionFilter,
	envFilter,
	onFilterChange,
	onRefresh,
	onExportCsv,
}: AuditLogFilterBarProps) {
	return (
		<div className='border-border bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'>
			<div className='flex flex-wrap items-center gap-3'>
				{/* Search */}
				<div className='relative min-w-55'>
					<Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
					<input
						type='text'
						placeholder='Search variable or user...'
						value={searchQuery}
						onChange={(e) => onFilterChange('search', e.target.value)}
						className='border-border bg-background placeholder:text-muted-foreground text-foreground w-full rounded-md border py-1.5 pr-3 pl-8 text-xs focus:ring-1 focus:outline-hidden'
					/>
				</div>

				{/* Action Filter */}
				<select
					value={actionFilter}
					onChange={(e) => onFilterChange('action', e.target.value)}
					className='border-border bg-background text-foreground rounded-md border px-2.5 py-1.5 text-xs'
				>
					<option value='ALL'>All Actions</option>
					<option value='SECRET_REVEAL'>Secret Reveals</option>
					<option value='SECRET_COPY'>Secret Copies</option>
					<option value='SECRET_CREATE'>Secret Creations</option>
					<option value='SECRET_UPDATE'>Secret Updates</option>
					<option value='SECRET_DELETE'>Secret Deletions</option>
					<option value='SECRET_ROLLBACK'>Secret Rollbacks</option>
					<option value='ENV_EXPORT'>Environment Exports</option>
					<option value='ENV_IMPORT'>Environment Imports</option>
				</select>

				{/* Environment Filter */}
				<select
					value={envFilter}
					onChange={(e) => onFilterChange('env', e.target.value)}
					className='border-border bg-background text-foreground rounded-md border px-2.5 py-1.5 text-xs'
				>
					<option value='all'>All Environments</option>
					<option value='dev'>dev</option>
					<option value='staging'>staging</option>
					<option value='prod'>prod</option>
					<option value='test'>test</option>
				</select>
			</div>

			{/* Right side actions */}
			<div className='flex items-center gap-2'>
				<button
					type='button'
					onClick={onRefresh}
					className='border-border text-muted-foreground hover:bg-hover hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition'
					title='Refresh log stream'
				>
					<RotateCcw className='h-3.5 w-3.5' />
					Refresh
				</button>
				<button
					type='button'
					onClick={onExportCsv}
					className='bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90'
				>
					<Download className='h-3.5 w-3.5' />
					Export CSV
				</button>
			</div>
		</div>
	)
}
