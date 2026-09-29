import type { SecretVersionChangeType } from './types'

export function SecretChangeBadge({
	changeType,
}: {
	changeType: SecretVersionChangeType | string
}) {
	switch (changeType) {
		case 'created':
			return (
				<span className='rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
					Created
				</span>
			)
		case 'rollback':
			return (
				<span className='rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
					Rollback
				</span>
			)
		case 'deleted':
			return (
				<span className='bg-danger/10 text-danger rounded px-2 py-0.5 text-xs font-medium'>
					Deleted
				</span>
			)
		case 'updated':
		default:
			return (
				<span className='bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs font-medium'>
					Updated
				</span>
			)
	}
}
