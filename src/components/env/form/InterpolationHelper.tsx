import { AlertCircle, Zap } from 'lucide-react'

interface InterpolationHelperProps {
	existingVariables: Record<string, string>
	onInsertReference: (refKey: string) => void
	interpolationPreview: {
		resolved: string
		error: string | null
		references?: string[]
	} | null
}

export function InterpolationHelper({
	existingVariables,
	onInsertReference,
	interpolationPreview,
}: InterpolationHelperProps) {
	const keys = Object.keys(existingVariables)

	return (
		<>
			{keys.length > 0 && (
				<div className='mt-1.5 flex flex-wrap items-center gap-1'>
					<span className='text-muted-foreground text-[11px]'>
						Insert reference:
					</span>
					{keys.slice(0, 6).map((existingKey) => (
						<button
							key={existingKey}
							type='button'
							onClick={() => onInsertReference(existingKey)}
							className='border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors'
						>
							+ ${`{${existingKey}}`}
						</button>
					))}
				</div>
			)}

			{interpolationPreview && (
				<div
					className={`mt-2 rounded-lg border p-2.5 text-xs ${
						interpolationPreview.error
							? 'border-destructive/30 bg-destructive/10 text-destructive'
							: 'border-primary/30 bg-primary/5 text-foreground'
					}`}
				>
					<div className='flex items-center gap-1.5 font-semibold'>
						{interpolationPreview.error ? (
							<AlertCircle className='text-destructive h-3.5 w-3.5 shrink-0' />
						) : (
							<Zap className='text-primary h-3.5 w-3.5 shrink-0' />
						)}
						<span>
							{interpolationPreview.error
								? 'Interpolation Warning'
								: 'Resolved Runtime Preview'}
						</span>
					</div>
					<p className='mt-1 font-mono text-xs break-all'>
						{interpolationPreview.error || interpolationPreview.resolved}
					</p>
				</div>
			)}
		</>
	)
}
