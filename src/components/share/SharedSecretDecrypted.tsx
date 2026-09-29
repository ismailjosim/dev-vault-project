import { Check, Copy, Eye, EyeOff, Flame, ShieldCheck } from 'lucide-react'

interface SharedSecretDecryptedProps {
	decryptedContent: string
	isMasked: boolean
	setIsMasked: (masked: boolean) => void
	copied: boolean
	onCopy: () => void
	isBurned: boolean
	remainingViews: number | null
}

export function SharedSecretDecrypted({
	decryptedContent,
	isMasked,
	setIsMasked,
	copied,
	onCopy,
	isBurned,
	remainingViews,
}: SharedSecretDecryptedProps) {
	return (
		<div className='border-border/60 bg-card rounded-2xl border p-6 shadow-xl'>
			<div className='flex flex-wrap items-center justify-between gap-3 border-b pb-4'>
				<div className='flex items-center gap-2.5'>
					<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
						<ShieldCheck className='h-5 w-5' />
					</div>
					<div>
						<h2 className='text-foreground text-base font-semibold'>
							Decrypted Secret Payload
						</h2>
						<p className='text-muted-foreground text-xs'>
							Decrypted locally via client-side AES-256
						</p>
					</div>
				</div>

				{isBurned ? (
					<div className='flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500'>
						<Flame className='h-3.5 w-3.5' />
						<span>Permanently Burned</span>
					</div>
				) : (
					remainingViews !== null && (
						<div className='flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500'>
							<span>{remainingViews} views remaining</span>
						</div>
					)
				)}
			</div>

			<div className='relative mt-4'>
				<pre
					className={`border-border/60 bg-muted/60 text-foreground overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed select-all ${
						isMasked ? 'blur-sm select-none' : ''
					}`}
				>
					{decryptedContent}
				</pre>
			</div>

			<div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={() => setIsMasked(!isMasked)}
						className='border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'
					>
						{isMasked ? (
							<>
								<Eye className='h-3.5 w-3.5' /> Show
							</>
						) : (
							<>
								<EyeOff className='h-3.5 w-3.5' /> Mask
							</>
						)}
					</button>

					<button
						type='button'
						onClick={onCopy}
						className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors'
					>
						{copied ? (
							<>
								<Check className='h-3.5 w-3.5 text-emerald-400' /> Copied!
							</>
						) : (
							<>
								<Copy className='h-3.5 w-3.5' /> Copy Secret
							</>
						)}
					</button>
				</div>

				<p className='text-muted-foreground/80 text-xs italic'>
					Make sure to copy or save this value now.
				</p>
			</div>
		</div>
	)
}
