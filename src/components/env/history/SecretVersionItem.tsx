import { Check, Copy, Eye, EyeOff, GitCompare, RotateCcw } from 'lucide-react'
import { SecretChangeBadge } from './SecretChangeBadge'
import { SecretVersionDiff } from './SecretVersionDiff'
import type { SecretVersion } from './types'

interface SecretVersionItemProps {
	version: SecretVersion
	isLatest: boolean
	isRevealed: boolean
	isComparing: boolean
	currentValue: string | null
	isRollingBack: boolean
	copiedValue: string | null
	onToggleReveal: () => void
	onToggleCompare: () => void
	onCopy: (value: string) => void
	onRollback: (versionNumber: number) => void
}

export function SecretVersionItem({
	version,
	isLatest,
	isRevealed,
	isComparing,
	currentValue,
	isRollingBack,
	copiedValue,
	onToggleReveal,
	onToggleCompare,
	onCopy,
	onRollback,
}: SecretVersionItemProps) {
	const versionVal = version.value || ''

	return (
		<div
			className={`border-border rounded-lg border p-4 transition ${
				isLatest ? 'bg-primary/5 border-primary/30' : 'bg-card'
			}`}
		>
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<span className='bg-primary text-primary-foreground rounded-md px-2 py-0.5 font-mono text-xs font-semibold'>
						v{version.versionNumber}
					</span>
					<SecretChangeBadge changeType={version.changeType} />
					{isLatest && (
						<span className='rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
							Current Value
						</span>
					)}
				</div>
				<div className='text-muted-foreground text-xs'>
					{new Date(version.createdAt).toLocaleString(undefined, {
						dateStyle: 'medium',
						timeStyle: 'short',
					})}
				</div>
			</div>

			{version.changeReason && (
				<p className='text-muted-foreground mt-2 text-xs italic'>
					&quot;{version.changeReason}&quot;
				</p>
			)}

			{/* Value display */}
			<div className='border-border bg-background mt-3 flex items-center justify-between rounded-md border px-3 py-2'>
				<span className='text-foreground max-w-sm truncate font-mono text-xs'>
					{isRevealed ? versionVal || '(empty)' : '••••••••••••••••'}
				</span>
				<div className='flex items-center gap-1.5'>
					<button
						type='button'
						onClick={onToggleReveal}
						className='text-muted-foreground hover:bg-hover hover:text-foreground rounded p-1 transition'
						title={isRevealed ? 'Mask value' : 'Reveal value'}
					>
						{isRevealed ? (
							<EyeOff className='h-3.5 w-3.5' />
						) : (
							<Eye className='h-3.5 w-3.5' />
						)}
					</button>
					{isRevealed && (
						<button
							type='button'
							onClick={() => onCopy(versionVal)}
							className='text-muted-foreground hover:bg-hover hover:text-foreground rounded p-1 transition'
							title='Copy value'
						>
							{copiedValue === String(version.versionNumber) ? (
								<Check className='h-3.5 w-3.5 text-emerald-500' />
							) : (
								<Copy className='h-3.5 w-3.5' />
							)}
						</button>
					)}
				</div>
			</div>

			{/* Actions & Comparison */}
			<div className='mt-3 flex items-center justify-end gap-2'>
				{!isLatest && currentValue !== null && (
					<button
						type='button'
						onClick={onToggleCompare}
						className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition'
					>
						<GitCompare className='h-3.5 w-3.5' />
						{isComparing ? 'Hide Diff' : 'Compare'}
					</button>
				)}

				{!isLatest && (
					<button
						type='button'
						disabled={isRollingBack}
						onClick={() => onRollback(version.versionNumber)}
						className='border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50'
					>
						<RotateCcw className='h-3.5 w-3.5' />
						{isRollingBack ? 'Restoring...' : 'Rollback to this version'}
					</button>
				)}
			</div>

			{/* Diff comparison box */}
			{isComparing && (
				<SecretVersionDiff
					versionNumber={version.versionNumber}
					versionValue={versionVal}
					currentValue={currentValue}
				/>
			)}
		</div>
	)
}
