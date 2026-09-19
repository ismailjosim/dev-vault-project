'use client'

import { useState, useEffect } from 'react'
import {
	Download,
	Search,
	ShieldAlert,
	RotateCcw,
	ChevronLeft,
	ChevronRight,
	Activity,
} from 'lucide-react'
import { toast } from 'react-toastify'

export type AuditLogItem = {
	_id: string
	userEmail: string
	action: string
	targetKey?: string
	environment?: string
	ipAddress?: string
	userAgent?: string
	createdAt: string
}

export function AuditLogTable({ projectId }: { projectId: string }) {
	const [logs, setLogs] = useState<AuditLogItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	const [actionFilter, setActionFilter] = useState('ALL')
	const [envFilter, setEnvFilter] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		let ignore = false

		async function load() {
			try {
				const params = new URLSearchParams({
					page: String(page),
					limit: '25',
				})

				if (actionFilter !== 'ALL') params.set('action', actionFilter)
				if (envFilter !== 'all') params.set('environment', envFilter)
				if (searchQuery.trim()) params.set('search', searchQuery.trim())

				const res = await fetch(`/api/projects/${projectId}/audit?${params}`)
				if (!res.ok) throw new Error('Failed to load audit logs')
				const data = await res.json()

				if (!ignore) {
					setLogs(data.logs || [])
					setTotal(data.total || 0)
					setPage(data.page || 1)
					setTotalPages(data.totalPages || 1)
					setIsLoading(false)
				}
			} catch {
				if (!ignore) {
					toast.error('Failed to load audit trail')
					setIsLoading(false)
				}
			}
		}

		void load()

		return () => {
			ignore = true
		}
	}, [projectId, page, actionFilter, envFilter, searchQuery, refreshTrigger])

	function handleExportCsv() {
		const params = new URLSearchParams({ format: 'csv' })
		if (actionFilter !== 'ALL') params.set('action', actionFilter)
		if (envFilter !== 'all') params.set('environment', envFilter)
		if (searchQuery.trim()) params.set('search', searchQuery.trim())

		window.open(
			`/api/projects/${projectId}/audit?${params.toString()}`,
			'_blank',
		)
	}

	function handleFilterChange(
		type: 'action' | 'env' | 'search',
		value: string,
	) {
		setIsLoading(true)
		setPage(1)
		if (type === 'action') setActionFilter(value)
		if (type === 'env') setEnvFilter(value)
		if (type === 'search') setSearchQuery(value)
	}

	return (
		<div className='space-y-4'>
			{/* Controls bar */}
			<div className='border-border bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-wrap items-center gap-3'>
					{/* Search */}
					<div className='relative min-w-55'>
						<Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
						<input
							type='text'
							placeholder='Search variable or user...'
							value={searchQuery}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							className='border-border bg-background placeholder:text-muted-foreground text-foreground w-full rounded-md border py-1.5 pr-3 pl-8 text-xs focus:ring-1 focus:outline-hidden'
						/>
					</div>

					{/* Action Filter */}
					<select
						value={actionFilter}
						onChange={(e) => handleFilterChange('action', e.target.value)}
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
						onChange={(e) => handleFilterChange('env', e.target.value)}
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
						onClick={() => {
							setIsLoading(true)
							setRefreshTrigger((prev) => prev + 1)
						}}
						className='border-border text-muted-foreground hover:bg-hover hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition'
						title='Refresh log stream'
					>
						<RotateCcw className='h-3.5 w-3.5' />
						Refresh
					</button>
					<button
						type='button'
						onClick={handleExportCsv}
						className='bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90'
					>
						<Download className='h-3.5 w-3.5' />
						Export CSV
					</button>
				</div>
			</div>

			{/* Logs Table */}
			<div className='border-border bg-card overflow-hidden rounded-lg border'>
				{isLoading ? (
					<div className='flex flex-col items-center justify-center py-16'>
						<div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
						<p className='text-muted-foreground mt-3 text-sm'>
							Loading audit stream...
						</p>
					</div>
				) : logs.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<ShieldAlert className='text-muted-foreground h-10 w-10 opacity-40' />
						<p className='text-foreground mt-3 text-sm font-medium'>
							No audit records found
						</p>
						<p className='text-muted-foreground text-xs'>
							Activities like reveals, copies, and updates will be logged here.
						</p>
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full min-w-160 text-left text-xs'>
							<thead>
								<tr className='text-muted-foreground border-border border-b uppercase'>
									<th className='px-4 py-3'>Timestamp</th>
									<th className='px-4 py-3'>Action</th>
									<th className='px-4 py-3'>Target Key</th>
									<th className='px-4 py-3'>Environment</th>
									<th className='px-4 py-3'>User</th>
									<th className='px-4 py-3'>IP Address</th>
								</tr>
							</thead>
							<tbody className='divide-border divide-y'>
								{logs.map((log) => (
									<tr key={log._id} className='hover:bg-hover/40 transition'>
										<td className='text-muted-foreground px-4 py-3 whitespace-nowrap'>
											{new Date(log.createdAt).toLocaleString(undefined, {
												dateStyle: 'medium',
												timeStyle: 'medium',
											})}
										</td>
										<td className='px-4 py-3'>
											<ActionBadge action={log.action} />
										</td>
										<td className='text-foreground px-4 py-3 font-mono font-medium'>
											{log.targetKey || '-'}
										</td>
										<td className='px-4 py-3'>
											{log.environment ? (
												<span className='bg-secondary text-secondary-foreground rounded px-2 py-0.5 font-mono text-[11px] uppercase'>
													{log.environment}
												</span>
											) : (
												'-'
											)}
										</td>
										<td className='text-foreground px-4 py-3 font-medium'>
											{log.userEmail}
										</td>
										<td className='text-muted-foreground px-4 py-3 font-mono text-[11px]'>
											{log.ipAddress || 'internal'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination bar */}
				<div className='border-border bg-muted/20 flex items-center justify-between border-t px-4 py-3'>
					<span className='text-muted-foreground text-xs'>
						Showing {logs.length} of {total} events
					</span>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							disabled={page <= 1 || isLoading}
							onClick={() => {
								setIsLoading(true)
								setPage((prev) => prev - 1)
							}}
							className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs disabled:opacity-40'
						>
							<ChevronLeft className='h-3.5 w-3.5' />
							Previous
						</button>
						<span className='text-muted-foreground text-xs font-medium'>
							Page {page} of {totalPages}
						</span>
						<button
							type='button'
							disabled={page >= totalPages || isLoading}
							onClick={() => {
								setIsLoading(true)
								setPage((prev) => prev + 1)
							}}
							className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs disabled:opacity-40'
						>
							Next
							<ChevronRight className='h-3.5 w-3.5' />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

function ActionBadge({ action }: { action: string }) {
	switch (action) {
		case 'SECRET_REVEAL':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400'>
					<Activity className='h-3 w-3' />
					Revealed
				</span>
			)
		case 'SECRET_COPY':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400'>
					Copied
				</span>
			)
		case 'SECRET_CREATE':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
					Created
				</span>
			)
		case 'SECRET_UPDATE':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400'>
					Updated
				</span>
			)
		case 'SECRET_DELETE':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400'>
					Deleted
				</span>
			)
		case 'SECRET_ROLLBACK':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400'>
					Rollback
				</span>
			)
		case 'ENV_EXPORT':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400'>
					Exported
				</span>
			)
		case 'ENV_IMPORT':
			return (
				<span className='inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400'>
					Imported
				</span>
			)
		default:
			return (
				<span className='bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold'>
					{action}
				</span>
			)
	}
}
