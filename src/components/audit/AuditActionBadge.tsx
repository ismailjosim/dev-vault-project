import { Activity } from 'lucide-react'

export function AuditActionBadge({ action }: { action: string }) {
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
