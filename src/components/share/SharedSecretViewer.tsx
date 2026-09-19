'use client'

import { clientDecrypt } from '@/utils/clientCrypto'
import {
	AlertTriangle,
	Check,
	Copy,
	Eye,
	EyeOff,
	Flame,
	KeyRound,
	Lock,
	ShieldAlert,
	ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SharedSecretViewerProps {
	shareId: string
}

interface SecretMeta {
	exists: boolean
	requiresPassphrase: boolean
	maxViews: number
	currentViews: number
	expiresAt: string
	createdAt?: string
}

export function SharedSecretViewer({ shareId }: SharedSecretViewerProps) {
	const [key, setKey] = useState<string | null>(() => {
		if (typeof window !== 'undefined') {
			return window.location.hash.replace(/^#/, '') || null
		}
		return null
	})
	const [meta, setMeta] = useState<SecretMeta | null>(null)
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)
	const [passphrase, setPassphrase] = useState('')
	const [decrypting, setDecrypting] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
	const [isMasked, setIsMasked] = useState(false)
	const [copied, setCopied] = useState(false)
	const [isBurned, setIsBurned] = useState(false)
	const [remainingViews, setRemainingViews] = useState<number | null>(null)

	useEffect(() => {
		async function fetchMeta() {
			try {
				const res = await fetch(`/api/tools/share/${shareId}`)
				if (!res.ok) {
					setNotFound(true)
					setLoading(false)
					return
				}
				const data: SecretMeta = await res.json()
				setMeta(data)
			} catch {
				setNotFound(true)
			} finally {
				setLoading(false)
			}
		}

		fetchMeta()
	}, [shareId])

	async function handleReveal() {
		setErrorMessage(null)
		setDecrypting(true)

		try {
			const res = await fetch(`/api/tools/share/${shareId}/burn`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ passphrase }),
			})

			const data = await res.json()

			if (!res.ok) {
				setErrorMessage(data.error || 'Failed to unlock secret')
				setDecrypting(false)
				return
			}

			if (!key) {
				setErrorMessage(
					'Encryption key is missing from the link URL fragment (#...). The sender must provide the full link.',
				)
				setDecrypting(false)
				return
			}

			// Decrypt zero-knowledge ciphertext client-side
			const plaintext = clientDecrypt(data.encryptedContent, key)
			setDecryptedContent(plaintext)
			setIsBurned(data.burned)
			setRemainingViews(data.remainingViews)
		} catch (err) {
			setErrorMessage(
				err instanceof Error
					? err.message
					: 'Decryption failed. Please check the encryption key.',
			)
		} finally {
			setDecrypting(false)
		}
	}

	async function handleCopy() {
		if (!decryptedContent) return
		try {
			await navigator.clipboard.writeText(decryptedContent)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// Fallback copy
		}
	}

	if (loading) {
		return (
			<div className='border-border/60 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-lg backdrop-blur-md'>
				<div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
				<p className='text-muted-foreground mt-4 text-sm font-medium'>
					Verifying secure link...
				</p>
			</div>
		)
	}

	if (notFound) {
		return (
			<div className='border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-xl'>
				<div className='bg-destructive/10 text-destructive flex h-14 w-14 items-center justify-center rounded-full'>
					<Flame className='h-7 w-7' />
				</div>
				<h2 className='text-foreground mt-4 text-xl font-semibold'>
					Secret Burned or Expired
				</h2>
				<p className='text-muted-foreground mt-2 max-w-md text-sm leading-relaxed'>
					This ephemeral secret has reached its view limit, expired, or was
					already permanently destroyed from DevVault&apos;s servers.
				</p>
			</div>
		)
	}

	if (decryptedContent !== null) {
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
							onClick={handleCopy}
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

			{!key && (
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
						onChange={(e) => setKey(e.target.value.trim() || null)}
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
					onClick={handleReveal}
					disabled={decrypting || !key}
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
