'use client'

import { useState } from 'react'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SecurityScanResult } from '@/utils/security-scanner'
import { SecurityIssueItem } from './SecurityIssueItem'
import { SecurityScoreOverview } from './SecurityScoreOverview'

interface SecurityHealthCardProps {
	projectId: string
	initialData: SecurityScanResult
}

export function SecurityHealthCard({
	projectId,
	initialData,
}: SecurityHealthCardProps) {
	const [data, setData] = useState<SecurityScanResult>(initialData)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all')
	const router = useRouter()

	const refreshScan = async () => {
		setIsRefreshing(true)
		try {
			const res = await fetch(`/api/projects/${projectId}/security`)
			if (res.ok) {
				const fresh = await res.json()
				setData(fresh)
				router.refresh()
			}
		} catch (e) {
			console.error('Scan refresh failed', e)
		} finally {
			setIsRefreshing(false)
		}
	}

	const filteredIssues = data.issues.filter((issue) => {
		if (filter === 'all') return true
		return issue.severity === filter
	})

	return (
		<div className='space-y-8'>
			<SecurityScoreOverview data={data} />

			{/* Diagnostics Issues Section */}
			<div className='space-y-4'>
				<div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
					<div>
						<h3 className='text-foreground text-base font-semibold'>
							Diagnostic Findings ({data.issues.length})
						</h3>
						<p className='text-muted-foreground text-xs'>
							Actionable security analysis based on static signature matching
							and Shannon entropy.
						</p>
					</div>

					<div className='flex items-center gap-2'>
						<div className='border-border bg-card flex rounded-md border p-0.5 text-xs font-medium'>
							<button
								type='button'
								onClick={() => setFilter('all')}
								className={`rounded px-2.5 py-1 ${
									filter === 'all'
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								All ({data.issues.length})
							</button>
							<button
								type='button'
								onClick={() => setFilter('critical')}
								className={`rounded px-2.5 py-1 ${
									filter === 'critical'
										? 'bg-destructive text-destructive-foreground'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								Critical ({data.metrics.criticalCount})
							</button>
							<button
								type='button'
								onClick={() => setFilter('warning')}
								className={`rounded px-2.5 py-1 ${
									filter === 'warning'
										? 'bg-amber-500 text-white'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								Warnings ({data.metrics.warningCount})
							</button>
						</div>

						<button
							type='button'
							onClick={refreshScan}
							disabled={isRefreshing}
							className='border-border bg-card text-foreground hover:bg-muted flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50'
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
							/>
							Rescan
						</button>
					</div>
				</div>

				{filteredIssues.length === 0 ? (
					<div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center'>
						<ShieldCheck className='mx-auto h-10 w-10 text-emerald-500' />
						<h4 className='text-foreground mt-2 text-sm font-semibold'>
							No Security Issues Found!
						</h4>
						<p className='text-muted-foreground mt-1 text-xs'>
							All environment variables passed pattern checks, entropy
							thresholds, and configuration audits.
						</p>
					</div>
				) : (
					<div className='space-y-3'>
						{filteredIssues.map((issue) => (
							<SecurityIssueItem
								key={issue.id}
								issue={issue}
								projectId={projectId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
