'use client'

import { useState } from 'react'
import {
	ShieldAlert,
	ShieldCheck,
	AlertTriangle,
	ExternalLink,
	Activity,
	CheckCircle2,
	RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SecurityScanResult } from '@/utils/security-scanner'

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

	const score = data.healthScore
	const scoreColor =
		score >= 90
			? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
			: score >= 70
				? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
				: 'text-destructive border-destructive/30 bg-destructive/10'

	const filteredIssues = data.issues.filter((issue) => {
		if (filter === 'all') return true
		return issue.severity === filter
	})

	return (
		<div className='space-y-8'>
			{/* Top Overview Grid */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{/* Overall Health Score Card */}
				<div className='border-border bg-card flex items-center justify-between rounded-xl border p-5 shadow-sm'>
					<div>
						<div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
							Security Health Score
						</div>
						<div className='mt-2 flex items-baseline gap-1'>
							<span className='text-foreground text-3xl font-bold'>
								{score}
							</span>
							<span className='text-muted-foreground text-xs'>/ 100</span>
						</div>
						<div className='text-muted-foreground mt-1 text-xs'>
							{score >= 90
								? 'Excellent security posture'
								: score >= 70
									? 'Minor vulnerabilities detected'
									: 'Critical security risks identified'}
						</div>
					</div>
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold ${scoreColor}`}
					>
						{score}%
					</div>
				</div>

				{/* Critical Issues */}
				<div className='border-border bg-card rounded-xl border p-5 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
							Critical Leaks
						</div>
						<ShieldAlert className='text-destructive h-4 w-4' />
					</div>
					<div className='text-destructive mt-2 text-3xl font-bold'>
						{data.metrics.criticalCount}
					</div>
					<p className='text-muted-foreground mt-1 text-xs'>
						Exposed patterns or production loopbacks
					</p>
				</div>

				{/* Warnings */}
				<div className='border-border bg-card rounded-xl border p-5 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
							Warnings
						</div>
						<AlertTriangle className='h-4 w-4 text-amber-500' />
					</div>
					<div className='mt-2 text-3xl font-bold text-amber-500'>
						{data.metrics.warningCount}
					</div>
					<p className='text-muted-foreground mt-1 text-xs'>
						Low entropy or debug flags enabled
					</p>
				</div>

				{/* Average Entropy */}
				<div className='border-border bg-card rounded-xl border p-5 shadow-sm'>
					<div className='flex items-center justify-between'>
						<div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
							Shannon Entropy
						</div>
						<Activity className='text-primary h-4 w-4' />
					</div>
					<div className='text-foreground mt-2 text-3xl font-bold'>
						{data.metrics.averageEntropy}{' '}
						<span className='text-muted-foreground text-xs font-normal'>
							bits/char
						</span>
					</div>
					<p className='text-muted-foreground mt-1 text-xs'>
						Randomness score across secrets
					</p>
				</div>
			</div>

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
								className={`rounded px-2.5 py-1 ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
							>
								All ({data.issues.length})
							</button>
							<button
								type='button'
								onClick={() => setFilter('critical')}
								className={`rounded px-2.5 py-1 ${filter === 'critical' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground'}`}
							>
								Critical ({data.metrics.criticalCount})
							</button>
							<button
								type='button'
								onClick={() => setFilter('warning')}
								className={`rounded px-2.5 py-1 ${filter === 'warning' ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
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
							<div
								key={issue.id}
								className='border-border bg-card hover:border-muted-foreground rounded-xl border p-4 shadow-sm transition'
							>
								<div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
									<div className='space-y-1.5'>
										<div className='flex items-center gap-2'>
											<span
												className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
													issue.severity === 'critical'
														? 'bg-destructive/10 text-destructive'
														: issue.severity === 'warning'
															? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
															: 'bg-muted text-muted-foreground'
												}`}
											>
												{issue.severity === 'critical' ? (
													<ShieldAlert className='h-3 w-3' />
												) : (
													<AlertTriangle className='h-3 w-3' />
												)}
												{issue.severity}
											</span>
											<span className='text-foreground font-mono text-sm font-bold'>
												{issue.variableKey}
											</span>
											<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase'>
												{issue.environment}
											</span>
										</div>

										<p className='text-foreground text-xs font-medium'>
											{issue.message}
										</p>

										<div className='text-muted-foreground flex items-start gap-1.5 text-xs'>
											<CheckCircle2 className='text-primary mt-0.5 h-3.5 w-3.5 shrink-0' />
											<span>
												<strong className='text-foreground font-medium'>
													Recommendation:{' '}
												</strong>
												{issue.recommendation}
											</span>
										</div>
									</div>

									<Link
										href={`/dashboard/projects/${projectId}?environment=${issue.environment}`}
										className='text-primary inline-flex shrink-0 items-center gap-1 self-start pt-1 text-xs font-semibold hover:underline'
									>
										<span>Edit Variable</span>
										<ExternalLink className='h-3 w-3' />
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
