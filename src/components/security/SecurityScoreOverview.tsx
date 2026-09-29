import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react'
import type { SecurityScanResult } from '@/utils/security-scanner'

interface SecurityScoreOverviewProps {
	data: SecurityScanResult
}

export function SecurityScoreOverview({ data }: SecurityScoreOverviewProps) {
	const score = data.healthScore
	const scoreColor =
		score >= 90
			? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
			: score >= 70
				? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
				: 'text-destructive border-destructive/30 bg-destructive/10'

	return (
		<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{/* Overall Health Score Card */}
			<div className='border-border bg-card flex items-center justify-between rounded-xl border p-5 shadow-sm'>
				<div>
					<div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
						Security Health Score
					</div>
					<div className='mt-2 flex items-baseline gap-1'>
						<span className='text-foreground text-3xl font-bold'>{score}</span>
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
	)
}
