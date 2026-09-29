'use client'

import { ShieldAlert } from 'lucide-react'
import { AuditActionBadge } from './AuditActionBadge'
import { AuditLogFilterBar } from './AuditLogFilterBar'
import { AuditLogPagination } from './AuditLogPagination'
import { useAuditLogs } from './useAuditLogs'
import type { AuditLogTableProps } from './types'

export function AuditLogTable({ projectId }: AuditLogTableProps) {
	const {
		logs,
		isLoading,
		total,
		page,
		setPage,
		totalPages,
		actionFilter,
		envFilter,
		searchQuery,
		handleFilterChange,
		handleExportCsv,
		refresh,
	} = useAuditLogs(projectId)

	return (
		<div className='space-y-4'>
			<AuditLogFilterBar
				searchQuery={searchQuery}
				actionFilter={actionFilter}
				envFilter={envFilter}
				onFilterChange={handleFilterChange}
				onRefresh={refresh}
				onExportCsv={handleExportCsv}
			/>

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
											<AuditActionBadge action={log.action} />
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

				<AuditLogPagination
					currentCount={logs.length}
					total={total}
					page={page}
					totalPages={totalPages}
					isLoading={isLoading}
					onPageChange={setPage}
				/>
			</div>
		</div>
	)
}
