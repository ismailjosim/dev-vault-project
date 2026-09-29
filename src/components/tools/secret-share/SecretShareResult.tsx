import { Check, Copy, Flame, RefreshCw, ShieldCheck } from 'lucide-react'

interface SecretShareResultProps {
	shareUrl: string
	copied: boolean
	onCopy: () => void
	onReset: () => void
}

export function SecretShareResult({
	shareUrl,
	copied,
	onCopy,
	onReset,
}: SecretShareResultProps) {
	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-3 border-b pb-4'>
				<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500'>
					<ShieldCheck className='h-5 w-5' />
				</div>
				<div>
					<h2 className='text-foreground text-lg font-semibold'>
						Ephemeral Link Ready
					</h2>
					<p className='text-muted-foreground text-xs'>
						Encrypted client-side. The secret will self-destruct once viewed.
					</p>
				</div>
			</div>

			<div className='space-y-2'>
				<label className='text-foreground text-xs font-semibold'>
					Shareable Zero-Knowledge Link
				</label>
				<div className='flex items-center gap-2'>
					<input
						type='text'
						readOnly
						value={shareUrl}
						className='border-border/60 bg-muted/60 text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono text-xs select-all focus:outline-none'
					/>
					<button
						type='button'
						onClick={onCopy}
						className='bg-primary text-primary-foreground hover:bg-primary/90 flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors'
					>
						{copied ? (
							<>
								<Check className='h-4 w-4 text-emerald-400' />
								<span>Copied!</span>
							</>
						) : (
							<>
								<Copy className='h-4 w-4' />
								<span>Copy Link</span>
							</>
						)}
					</button>
				</div>
			</div>

			<div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-500'>
				<div className='flex items-center gap-1.5 font-semibold'>
					<Flame className='h-4 w-4' />
					<span>Burn-After-Reading Active</span>
				</div>
				<p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
					This link contains the 256-bit decryption key in its URL fragment (#).
					DevVault servers never receive the key. Send this link to your
					recipient via Slack, Discord, or Email safely.
				</p>
			</div>

			<button
				type='button'
				onClick={onReset}
				className='border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors'
			>
				<RefreshCw className='h-3.5 w-3.5' />
				<span>Share Another Secret</span>
			</button>
		</div>
	)
}
