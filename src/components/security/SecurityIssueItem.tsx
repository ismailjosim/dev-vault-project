import {
	AlertTriangle,
	CheckCircle2,
	ExternalLink,
	ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import type { SecurityIssue } from '@/utils/security-scanner'

interface SecurityIssueItemProps {
	issue: SecurityIssue
	projectId: string
}

export function SecurityIssueItem({
	issue,
	projectId,
}: SecurityIssueItemProps) {
	return (
		<div className='border-border bg-card hover:border-muted-foreground rounded-xl border p-4 shadow-sm transition'>
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

					<p className='text-foreground text-xs font-medium'>{issue.message}</p>

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
	)
}
