import { ShieldCheck } from 'lucide-react'

export function LandingSecurityArchitecture() {
	return (
		<section
			id='security'
			className='border-border/40 bg-muted/20 relative border-y py-24 sm:py-32'
		>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				{/* Section Header */}
				<div className='mx-auto max-w-3xl text-center'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500'>
						<ShieldCheck className='h-3.5 w-3.5' />
						<span>Cryptographic Integrity</span>
					</div>
					<h2 className='text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl'>
						Security by Design: Zero-Knowledge Architecture
					</h2>
					<p className='text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg'>
						DevVault protects your secrets with defense-in-depth principles.
						Even in the unlikely event of database access, secrets remain
						unreadable ciphertext.
					</p>
				</div>

				{/* Visual Architecture Flow */}
				<div className='mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3'>
					{/* Step 1 */}
					<div className='border-border/60 bg-card relative rounded-2xl border p-6 shadow-sm'>
						<div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold'>
							01
						</div>
						<h3 className='text-foreground mt-4 text-lg font-bold'>
							Envelope Encryption
						</h3>
						<p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
							Each environment secret has its value encrypted using AES-256-GCM.
							A randomized 12-byte initialization vector (IV) and 16-byte
							authentication tag are generated on every save.
						</p>
						<div className='bg-muted/80 text-foreground mt-5 rounded-lg p-3 font-mono text-xs'>
							<span className='text-muted-foreground'>
								{'// Cryptographic payload'}
							</span>
							<div className='mt-1 font-medium text-emerald-500'>
								iv: &quot;3f9a12c8...&quot; (96-bit)
							</div>
							<div className='text-primary font-medium'>
								cipher: &quot;e4b89f2a...&quot; (AES-256)
							</div>
							<div className='font-medium text-indigo-400'>
								tag: &quot;71c0b3d1...&quot; (128-bit)
							</div>
						</div>
					</div>

					{/* Step 2 */}
					<div className='border-border/60 bg-card relative rounded-2xl border p-6 shadow-sm'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-500'>
							02
						</div>
						<h3 className='text-foreground mt-4 text-lg font-bold'>
							Ephemeral URL Hash Fragments
						</h3>
						<p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
							When generating self-destructing links, the encryption key is
							appended to the URL as a hash fragment (
							<code className='font-mono text-xs'>#key</code>). Web browsers
							never send hash fragments in HTTP requests.
						</p>
						<div className='bg-muted/80 text-foreground mt-5 rounded-lg p-3 font-mono text-xs'>
							<span className='text-muted-foreground'>
								{'// Never logged on servers'}
							</span>
							<div className='mt-1 truncate font-medium text-rose-400'>
								https://vault.dev/share/abc...
							</div>
							<div className='truncate font-medium text-amber-400'>
								#key=d83f81e2b4...
							</div>
						</div>
					</div>

					{/* Step 3 */}
					<div className='border-border/60 bg-card relative rounded-2xl border p-6 shadow-sm'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-500'>
							03
						</div>
						<h3 className='text-foreground mt-4 text-lg font-bold'>
							In-Memory CLI Injection
						</h3>
						<p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
							The <code className='font-mono text-xs'>devvault run</code>{' '}
							command resolves variables directly in Node/OS process memory,
							passing them down as environment parameters to child processes
							without writing to disk.
						</p>
						<div className='bg-muted/80 text-foreground mt-5 rounded-lg p-3 font-mono text-xs'>
							<span className='text-muted-foreground'>
								{'// Child process inherits memory'}
							</span>
							<div className='mt-1 font-medium text-cyan-400'>
								process.spawn(&quot;next&quot;, [&quot;dev&quot;], &#123;
							</div>
							<div className='text-primary pl-4 font-medium'>
								env: decryptedInRAM
							</div>
							<div className='font-medium text-cyan-400'>&#125;)</div>
						</div>
					</div>
				</div>

				{/* Security Compliance Pillars */}
				<div className='border-border/60 bg-card mt-12 grid grid-cols-2 gap-4 rounded-2xl border p-6 sm:grid-cols-4 sm:p-8'>
					<div className='text-center'>
						<div className='text-primary text-2xl font-black sm:text-3xl'>
							AES-256
						</div>
						<div className='text-muted-foreground mt-1 text-xs font-medium sm:text-sm'>
							GCM Authenticated
						</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-black text-indigo-500 sm:text-3xl'>
							PBKDF2
						</div>
						<div className='text-muted-foreground mt-1 text-xs font-medium sm:text-sm'>
							Passphrase Hashing
						</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-black text-rose-500 sm:text-3xl'>
							100%
						</div>
						<div className='text-muted-foreground mt-1 text-xs font-medium sm:text-sm'>
							Audit Logging Coverage
						</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-black text-emerald-500 sm:text-3xl'>
							0 Plaintext
						</div>
						<div className='text-muted-foreground mt-1 text-xs font-medium sm:text-sm'>
							Stored on Disk
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
