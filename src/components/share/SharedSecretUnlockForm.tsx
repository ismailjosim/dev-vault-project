import { AlertTriangle, Flame, KeyRound, Lock, ShieldAlert } from 'lucide-react'
import type { SecretMeta } from './types'

interface SharedSecretUnlockFormProps {
	secretKey: string | null
	setSecretKey: (k: string | null) => void
	meta: SecretMeta | null
	passphrase: string
	setPassphrase: (p: string) => void
	errorMessage: string | null
	decrypting: boolean
	onReveal: () => void
}

export function SharedSecretUnlockForm({
	secretKey,
	setSecretKey,
	meta,
	passphrase,
	setPassphrase,
	errorMessage,
	decrypting,
	onReveal,
}: SharedSecretUnlockFormProps) {
	return (
		<div className='border-border/60 bg-card rounded-2xl border p-6 shadow-xl'>
			<div className='flex items-center gap-3 border-b pb-4'>
				<div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl'>
					<Lock className='h-5 w-5' />
				</div>
				<div>
					<h2 className='text-foreground text-lg font-semibold'>
						Encrypted Ephemeral Secret
					</h2>
					<p className='text-muted-foreground text-xs'>
						Zero-knowledge encrypted payload awaiting retrieval
					</p>
				</div>
			</div>

			{!secretKey && (
				<div className='mt-5 space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-500'>
					<div className='flex items-start gap-2'>
						<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
						<div>
							<span className='font-semibold'>Decryption Key Missing: </span>
							The URL fragment (#key) is required to decrypt this secret in your
							browser. You can paste the encryption key below if you received it
							separately.
						</div>
					</div>
					<input
						type='text'
						placeholder='Paste 256-bit encryption key...'
						onChange={(e) => setSecretKey(e.target.value.trim() || null)}
						className='bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border border-amber-500/40 px-3 py-1.5 font-mono text-xs focus:outline-none'
					/>
				</div>
			)}

			<div className='bg-muted/40 border-border/40 mt-5 space-y-2.5 rounded-xl border p-4 text-xs'>
				<div className='flex items-center justify-between'>
					<span className='text-muted-foreground'>Expiration:</span>
					<span className='text-foreground font-medium'>
						{meta?.expiresAt
							? new Date(meta.expiresAt).toLocaleString()
							: 'Upcoming'}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<span className='text-muted-foreground'>Destruction Rule:</span>
					<span className='text-foreground font-medium'>
						{meta?.maxViews === 1
							? 'Burns immediately upon reveal'
							: `Burns after ${meta?.maxViews} views`}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<span className='text-muted-foreground'>Zero-Knowledge:</span>
					<span className='font-medium text-emerald-500'>
						Encrypted client-side (Never read by server)
					</span>
				</div>
			</div>

			{meta?.requiresPassphrase && (
				<div className='mt-5 space-y-2'>
					<label
						htmlFor='passphrase-input'
						className='text-foreground flex items-center gap-1.5 text-xs font-medium'
					>
						<KeyRound className='h-3.5 w-3.5 text-amber-500' />
						Passphrase Required
					</label>
					<input
						id='passphrase-input'
						type='password'
						value={passphrase}
						onChange={(e) => setPassphrase(e.target.value)}
						placeholder='Enter the passphrase set by the sender'
						className='border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3.5 py-2 text-sm focus:ring-2 focus:outline-none'
					/>
				</div>
			)}

			{errorMessage && (
				<div className='border-destructive/30 bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs'>
					<ShieldAlert className='h-4 w-4 shrink-0' />
					<span>{errorMessage}</span>
				</div>
			)}

			<div className='mt-6'>
				<button
					type='button'
					onClick={onReveal}
					disabled={decrypting || !secretKey}
					className='bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-md transition-all disabled:opacity-50'
				>
					{decrypting ? (
						<>
							<div className='border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
							<span>Decrypting & Burning...</span>
						</>
					) : (
						<>
							<Flame className='h-4 w-4 text-amber-400' />
							<span>Reveal & Burn Secret</span>
						</>
					)}
				</button>
				<p className='text-muted-foreground mt-2 text-center text-xs'>
					Clicking reveal will retrieve the ciphertext and permanently delete it
					once view limits are met.
				</p>
			</div>
		</div>
	)
}
