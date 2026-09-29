interface SecretVersionDiffProps {
	versionNumber: number
	versionValue: string
	currentValue: string | null
}

export function SecretVersionDiff({
	versionNumber,
	versionValue,
	currentValue,
}: SecretVersionDiffProps) {
	return (
		<div className='border-border bg-muted/40 mt-3 rounded-md border p-3 text-xs'>
			<div className='text-muted-foreground mb-2 font-semibold'>
				Comparison with Current Version:
			</div>
			<div className='grid grid-cols-2 gap-3'>
				<div className='border-danger/20 bg-danger/5 rounded border p-2'>
					<span className='text-danger block text-[10px] font-bold uppercase'>
						v{versionNumber} (Historical)
					</span>
					<p className='mt-1 font-mono break-all'>
						{versionValue || '(empty)'}
					</p>
				</div>
				<div className='rounded border border-emerald-500/20 bg-emerald-500/5 p-2'>
					<span className='block text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400'>
						Current Active Value
					</span>
					<p className='mt-1 font-mono break-all'>
						{currentValue || '(empty)'}
					</p>
				</div>
			</div>
		</div>
	)
}
