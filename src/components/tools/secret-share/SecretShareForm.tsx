import { Clock, Eye, EyeOff, Flame, Lock } from 'lucide-react'

interface SecretShareFormProps {
	secretText: string
	setSecretText: (text: string) => void
	isMasked: boolean
	setIsMasked: (masked: boolean) => void
	ttlSeconds: number
	setTtlSeconds: (ttl: number) => void
	maxViews: number
	setMaxViews: (views: number) => void
	usePassphrase: boolean
	setUsePassphrase: (use: boolean) => void
	passphrase: string
	setPassphrase: (phrase: string) => void
	loading: boolean
	error: string | null
	onSubmit: (e: React.FormEvent) => void
}

export function SecretShareForm({
	secretText,
	setSecretText,
	isMasked,
	setIsMasked,
	ttlSeconds,
	setTtlSeconds,
	maxViews,
	setMaxViews,
	usePassphrase,
	setUsePassphrase,
	passphrase,
	setPassphrase,
	loading,
	error,
	onSubmit,
}: SecretShareFormProps) {
	return (
		<form onSubmit={onSubmit} className='space-y-5'>
			<div>
				<div className='flex items-center justify-between pb-2'>
					<label
						htmlFor='secret-content'
						className='text-foreground text-xs font-semibold'
					>
						Secret Content / Sensitive Payload *
					</label>
					<button
						type='button'
						onClick={() => setIsMasked(!isMasked)}
						className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs'
					>
						{isMasked ? (
							<>
								<Eye className='h-3 w-3' /> Show
							</>
						) : (
							<>
								<EyeOff className='h-3 w-3' /> Mask
							</>
						)}
					</button>
				</div>
				<textarea
					id='secret-content'
					rows={5}
					value={secretText}
					onChange={(e) => setSecretText(e.target.value)}
					placeholder='Paste database credentials, API tokens, private SSH keys, or .env strings...'
					className={`border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:ring-2 focus:outline-none ${
						isMasked ? 'blur-sm select-none' : ''
					}`}
				/>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				{/* TTL Expiration */}
				<div>
					<label
						htmlFor='ttl-select'
						className='text-foreground flex items-center gap-1.5 text-xs font-medium'
					>
						<Clock className='h-3.5 w-3.5 text-blue-500' />
						Lifetime Expiry
					</label>
					<select
						id='ttl-select'
						value={ttlSeconds}
						onChange={(e) => setTtlSeconds(Number(e.target.value))}
						className='border-border/60 bg-background text-foreground mt-1.5 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none'
					>
						<option value={600}>10 minutes</option>
						<option value={3600}>1 hour</option>
						<option value={86400}>24 hours (1 day)</option>
						<option value={604800}>7 days</option>
					</select>
				</div>

				{/* Max Views */}
				<div>
					<label
						htmlFor='views-select'
						className='text-foreground flex items-center gap-1.5 text-xs font-medium'
					>
						<Flame className='h-3.5 w-3.5 text-amber-500' />
						View Destruction Rule
					</label>
					<select
						id='views-select'
						value={maxViews}
						onChange={(e) => setMaxViews(Number(e.target.value))}
						className='border-border/60 bg-background text-foreground mt-1.5 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none'
					>
						<option value={1}>1 view (Burn immediately 🔥)</option>
						<option value={2}>2 views</option>
						<option value={5}>5 views</option>
					</select>
				</div>
			</div>

			{/* Passphrase Option */}
			<div className='border-border/40 bg-muted/20 space-y-3 rounded-xl border p-4'>
				<label className='flex cursor-pointer items-center gap-2 text-xs font-medium'>
					<input
						type='checkbox'
						checked={usePassphrase}
						onChange={(e) => setUsePassphrase(e.target.checked)}
						className='text-primary rounded'
					/>
					<span className='text-foreground'>
						Require an additional passphrase to decrypt
					</span>
				</label>

				{usePassphrase && (
					<div className='pt-1'>
						<input
							type='password'
							value={passphrase}
							onChange={(e) => setPassphrase(e.target.value)}
							placeholder='Enter recipient passphrase'
							className='border-border/60 bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-3 py-2 text-xs focus:outline-none'
						/>
						<p className='text-muted-foreground mt-1 text-[11px]'>
							The recipient will need this passphrase in addition to the link.
						</p>
					</div>
				)}
			</div>

			{error && (
				<div className='border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-xs'>
					{error}
				</div>
			)}

			<button
				type='submit'
				disabled={loading || !secretText.trim()}
				className='bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50'
			>
				{loading ? (
					<>
						<div className='border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
						<span>Encrypting on Client...</span>
					</>
				) : (
					<>
						<Lock className='h-3.5 w-3.5' />
						<span>Create Ephemeral Secret Link</span>
					</>
				)}
			</button>
		</form>
	)
}
