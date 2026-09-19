'use client'

import { clientEncrypt, generateClientKey } from '@/utils/clientCrypto'
import {
	Check,
	Clock,
	Copy,
	Eye,
	EyeOff,
	Flame,
	KeyRound,
	Lock,
	RefreshCw,
	ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

export function SecretShareTool() {
	const [secretText, setSecretText] = useState('')
	const [ttlSeconds, setTtlSeconds] = useState(3600) // 1 hour default
	const [maxViews, setMaxViews] = useState(1) // 1 view burn default
	const [usePassphrase, setUsePassphrase] = useState(false)
	const [passphrase, setPassphrase] = useState('')
	const [isMasked, setIsMasked] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [shareUrl, setShareUrl] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	async function handleGenerateLink(e: React.FormEvent) {
		e.preventDefault()
		if (!secretText.trim()) {
			setError('Please enter a secret value to share.')
			return
		}

		setLoading(true)
		setError(null)

		try {
			// 1. Generate random 256-bit client encryption key
			const clientKey = generateClientKey()

			// 2. Encrypt locally in browser
			const encryptedContent = clientEncrypt(secretText, clientKey)

			// 3. Send only ciphertext and metadata to server
			const res = await fetch('/api/tools/share', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					encryptedContent,
					maxViews,
					ttlSeconds,
					passphrase: usePassphrase ? passphrase.trim() : undefined,
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Failed to create ephemeral share')
			}

			// 4. Construct zero-knowledge URL with key in fragment hash (#)
			const origin =
				typeof window !== 'undefined'
					? window.location.origin
					: 'https://devvault.app'
			const generatedLink = `${origin}/share/${data.shareId}#${clientKey}`
			setShareUrl(generatedLink)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred.',
			)
		} finally {
			setLoading(false)
		}
	}

	async function handleCopy() {
		if (!shareUrl) return
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2500)
		} catch {
			// Fallback
		}
	}

	function handleReset() {
		setSecretText('')
		setShareUrl(null)
		setPassphrase('')
		setUsePassphrase(false)
		setError(null)
	}

	return (
		<div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
			{/* Main Form or Generated Result */}
			<div className='border-border/60 bg-card rounded-2xl border p-6 shadow-sm'>
				{shareUrl ? (
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
									Encrypted client-side. The secret will self-destruct once
									viewed.
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
									onClick={handleCopy}
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
								This link contains the 256-bit decryption key in its URL
								fragment (#). DevVault servers never receive the key. Send this
								link to your recipient via Slack, Discord, or Email safely.
							</p>
						</div>

						<button
							type='button'
							onClick={handleReset}
							className='border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors'
						>
							<RefreshCw className='h-3.5 w-3.5' />
							<span>Share Another Secret</span>
						</button>
					</div>
				) : (
					<form onSubmit={handleGenerateLink} className='space-y-5'>
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
										The recipient will need this passphrase in addition to the
										link.
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
				)}
			</div>

			{/* Security Explainer Sidebar */}
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
								<code className='bg-muted rounded px-1'>#key</code>) and is
								never sent to DevVault&apos;s servers.
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
		</div>
	)
}
