import { AlertTriangle, Check, Copy, Loader2 } from 'lucide-react'

interface CreateApiKeyModalProps {
	isOpen: boolean
	name: string
	setName: (name: string) => void
	expiresInDays: number | null
	setExpiresInDays: (days: number | null) => void
	isLoading: boolean
	createdToken: string | null
	hasCopied: boolean
	error: string | null
	onClose: () => void
	onCreate: (e: React.FormEvent) => void
	onCopy: (text: string) => void
}

export function CreateApiKeyModal({
	isOpen,
	name,
	setName,
	expiresInDays,
	setExpiresInDays,
	isLoading,
	createdToken,
	hasCopied,
	error,
	onClose,
	onCreate,
	onCopy,
}: CreateApiKeyModalProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
			<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
				{!createdToken ? (
					<>
						<h3 className='text-foreground text-lg font-semibold'>
							Generate Personal Access Token
						</h3>
						<p className='text-muted-foreground mt-1 text-xs'>
							Tokens have full API access scoped to projects and workspaces you
							belong to.
						</p>

						{error && (
							<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 rounded-md border p-2.5 text-xs'>
								{error}
							</div>
						)}

						<form onSubmit={onCreate} className='mt-4 space-y-4'>
							<div>
								<label className='text-foreground block text-xs font-medium'>
									Token Name / Description
								</label>
								<input
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder='MacBook Pro M3 or GitHub Actions'
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									Expiration
								</label>
								<select
									value={expiresInDays === null ? 'never' : expiresInDays}
									onChange={(e) =>
										setExpiresInDays(
											e.target.value === 'never'
												? null
												: Number(e.target.value),
										)
									}
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								>
									<option value='7'>7 days</option>
									<option value='30'>30 days (Recommended)</option>
									<option value='90'>90 days</option>
									<option value='365'>1 year</option>
									<option value='never'>No expiration (Permanent)</option>
								</select>
							</div>

							<div className='flex items-center justify-end gap-2 pt-2'>
								<button
									type='button'
									onClick={onClose}
									className='border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-xs font-medium'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={isLoading || !name}
									className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50'
								>
									{isLoading && (
										<Loader2 className='h-3.5 w-3.5 animate-spin' />
									)}
									Generate Token
								</button>
							</div>
						</form>
					</>
				) : (
					<div className='space-y-4'>
						<div className='flex items-center gap-2 text-emerald-500'>
							<Check className='h-5 w-5' />
							<h3 className='text-foreground text-lg font-semibold'>
								Token Generated!
							</h3>
						</div>

						<div className='flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400'>
							<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
							<div>
								Make sure to copy your Personal Access Token now. You will not
								be able to view it again!
							</div>
						</div>

						<div className='border-border bg-muted/60 text-foreground flex items-center justify-between gap-2 rounded-lg border p-3 font-mono text-xs break-all'>
							<span>{createdToken}</span>
							<button
								type='button'
								onClick={() => onCopy(createdToken)}
								className='hover:bg-background text-muted-foreground hover:text-foreground shrink-0 rounded p-1.5'
								title='Copy token'
							>
								{hasCopied ? (
									<Check className='h-4 w-4 text-emerald-500' />
								) : (
									<Copy className='h-4 w-4' />
								)}
							</button>
						</div>

						<div className='flex justify-end pt-2'>
							<button
								type='button'
								onClick={onClose}
								className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90'
							>
								Done
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
