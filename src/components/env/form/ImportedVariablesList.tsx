import type { ParsedEnvVariable } from '@/utils/env-parser'

interface ImportedVariablesListProps {
	variables: ParsedEnvVariable[]
	onClear: () => void
}

export function ImportedVariablesList({
	variables,
	onClear,
}: ImportedVariablesListProps) {
	if (variables.length === 0) return null

	return (
		<div className='border-border mt-4 rounded-md border'>
			<div className='border-border flex items-center justify-between border-b px-3 py-2'>
				<span className='text-foreground text-sm'>
					Detected {variables.length} variable
					{variables.length === 1 ? '' : 's'}
				</span>
				<button
					type='button'
					onClick={onClear}
					className='text-muted-foreground hover:text-foreground text-xs'
				>
					Clear
				</button>
			</div>
			<div className='max-h-40 overflow-auto'>
				{variables.map((variable) => (
					<div
						key={variable.key}
						className='border-border grid grid-cols-[1fr_120px] border-b px-3 py-2 text-sm last:border-b-0'
					>
						<span className='text-foreground truncate font-mono'>
							{variable.key}
						</span>
						<span className='text-muted-foreground font-mono'>••••••••</span>
					</div>
				))}
			</div>
		</div>
	)
}
