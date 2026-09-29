import { ENVIRONMENTS } from './types'

interface EnvironmentSelectorProps {
	isSensitive: boolean
	onToggleSensitive: () => void
	type: string
	onTypeChange: (nextType: string) => void
	selectedEnvironments: string[]
	onToggleEnvironment: (envId: string) => void
}

export function EnvironmentSelector({
	isSensitive,
	onToggleSensitive,
	type,
	onTypeChange,
	selectedEnvironments,
	onToggleEnvironment,
}: EnvironmentSelectorProps) {
	return (
		<div className='border-border mt-5 border-t pt-4'>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={onToggleSensitive}
						className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
							isSensitive ? 'bg-primary' : 'bg-secondary'
						}`}
					>
						<span
							className={`bg-card h-4 w-4 rounded-full transition ${
								isSensitive ? 'translate-x-4' : ''
							}`}
						/>
					</button>
					<span className='text-foreground text-sm'>Sensitive</span>
				</div>

				<select
					value={type}
					onChange={(event) => onTypeChange(event.target.value)}
					className='border-border bg-background text-foreground rounded-md border px-3 py-2 text-sm'
				>
					<option value='secret'>Secret</option>
					<option value='jwt'>JWT</option>
					<option value='api_key'>API key</option>
					<option value='url'>URL</option>
					<option value='database_url'>Database URL</option>
					<option value='other'>Other</option>
				</select>
			</div>

			<div className='mt-4'>
				<p className='text-muted-foreground text-xs font-medium'>
					Environments
				</p>
				<div className='mt-2 space-y-2'>
					{ENVIRONMENTS.map((environment) => (
						<label
							key={environment.id}
							className='border-border text-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm'
						>
							<input
								type='checkbox'
								checked={selectedEnvironments.includes(environment.id)}
								onChange={() => onToggleEnvironment(environment.id)}
								className='h-4 w-4'
							/>
							{environment.label}
						</label>
					))}
				</div>
			</div>
		</div>
	)
}
