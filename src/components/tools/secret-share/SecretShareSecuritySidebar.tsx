import { KeyRound, ShieldCheck } from 'lucide-react'

export function SecretShareSecuritySidebar() {
	return (
		<div className='space-y-4'>
			<div className='border-border/60 bg-card rounded-2xl border p-5 shadow-sm'>
				<div className='flex items-center gap-2'>
					<ShieldCheck className='h-4 w-4 text-emerald-500' />
					<h3 className='text-foreground text-sm font-semibold'>
						Zero-Knowledge Security
					</h3>
				</div>
				<ul className='text-muted-foreground mt-3 space-y-2.5 text-xs leading-relaxed'>
					<li className='flex items-start gap-2'>
						<span className='text-primary font-bold'>•</span>
						<span>
							Secrets are encrypted inside your browser via{' '}
							<strong>AES-256</strong> before anything touches the network.
						</span>
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-primary font-bold'>•</span>
						<span>
							The decryption key is attached only to the URL hash (
							<code className='bg-muted rounded px-1'>#key</code>) and is never
							sent to DevVault&apos;s servers.
						</span>
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-primary font-bold'>•</span>
						<span>
							Once the recipient views the secret or TTL expires, the database
							record is permanently erased.
						</span>
					</li>
				</ul>
			</div>

			<div className='border-border/60 bg-card rounded-2xl border p-5 shadow-sm'>
				<div className='flex items-center gap-2'>
					<KeyRound className='h-4 w-4 text-amber-500' />
					<h3 className='text-foreground text-sm font-semibold'>
						Best Practices
					</h3>
				</div>
				<p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
					If sharing highly critical database production passwords or private
					keys, consider enabling the extra passphrase and transmitting the
					passphrase over a separate channel (e.g. Signal or SMS).
				</p>
			</div>
		</div>
	)
}
